import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Info, ShieldCheck, Sparkles, Tag, Truck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/catalog";
import {
  checkoutSchema,
  DELIVERY_FLAT,
  FREE_DELIVERY_THRESHOLD,
  paymentMethods,
  type PaymentMethod,
} from "@/lib/checkout";
import { KENYA_COUNTIES, findCounty } from "@/lib/kenya-locations";
import { applyDiscount, type DiscountCode } from "@/lib/discounts";
import { cn } from "@/lib/utils";
import { getOrderPaymentStatus, placeOrder } from "@/lib/orders.functions";
import { DeliveryButton, useDeliverySequence } from "@/components/DeliveryButton";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — O&N" },
      { name: "description", content: "Complete your O&N order." },
      { property: "og:title", content: "Checkout — O&N" },
      { property: "og:description", content: "Complete your O&N order." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [selectedCounty, setSelectedCounty] = useState<string>("Nairobi");
  const [selectedTown, setSelectedTown] = useState<string>("Kilimani");
  const [instructions, setInstructions] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [submitting, setSubmitting] = useState(false);

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<DiscountCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // STK Push Countdown State
  const [stkPending, setStkPending] = useState(false);
  const [stkSecondsLeft, setStkSecondsLeft] = useState(60);

  const delivery_anim = useDeliverySequence();
  const submitOrder = useServerFn(placeOrder);
  const checkStatus = useServerFn(getOrderPaymentStatus);

  const standardDelivery =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
  const effectiveDelivery = appliedPromo?.type === "free_delivery" ? 0 : standardDelivery;
  const finalTotal = Math.max(0, subtotal - discountAmount + effectiveDelivery);

  const countyData = findCounty(selectedCounty) ?? KENYA_COUNTIES[0];

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setSignedIn(!!data.user);
        if (data.user?.email) setUserEmail(data.user.email);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
      if (session?.user?.email) setUserEmail(session.user.email);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Live STK push countdown timer
  useEffect(() => {
    if (!stkPending) return;
    setStkSecondsLeft(60);
    const interval = setInterval(() => {
      setStkSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStkPending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stkPending]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = applyDiscount(promoInput, subtotal, standardDelivery);
    if (res.success && res.appliedDiscount) {
      setAppliedPromo(res.appliedDiscount);
      setDiscountAmount(res.discountAmount);
      toast.success("Promo code applied!", { description: res.message });
    } else {
      toast.error("Invalid promo code", { description: res.message });
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoInput("");
    toast("Promo code removed");
  };

  const pollPayment = async (orderId: string) => {
    setStkPending(true);
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 4000));
      const res = await checkStatus({ data: { orderId } });
      if (res.paymentStatus === "paid") {
        setStkPending(false);
        delivery_anim.finish();
        toast.success("Payment Received — Thank You!", {
          description: "Your order is confirmed and being prepared for dispatch.",
        });
        clear();
        setTimeout(() => navigate({ to: "/account", search: { tab: "orders" } }), 1200);
        return;
      }
      if (res.paymentStatus === "failed") {
        setStkPending(false);
        delivery_anim.fail();
        toast.error("M-Pesa payment failed", {
          description: res.message ?? "Transaction was not completed.",
        });
        return;
      }
    }
    setStkPending(false);
    toast.warning("STK Push timed out", {
      description:
        "If you already entered your PIN, your order will update automatically in your account.",
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      fullName,
      phone,
      email: userEmail,
      address,
      county: selectedCounty,
      town: selectedTown,
      instructions,
      paymentMethod: payment,
    };

    const parsed = checkoutSchema.safeParse(payload);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Please fill in the highlighted delivery details");
      return;
    }

    setErrors({});
    setSubmitting(true);
    delivery_anim.start();

    try {
      const res = await submitOrder({
        data: {
          ...parsed.data,
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        },
      });

      if (res.mpesa === "not_required") {
        delivery_anim.finish();
        toast.success("Order confirmed!", { description: "Pay rider upon delivery." });
        clear();
        setTimeout(() => navigate({ to: "/account", search: { tab: "orders" } }), 1000);
      } else if (res.mpesa === "prompt_sent") {
        toast.success("Check your phone", {
          description: `Enter your M-Pesa PIN to pay ${formatKES(res.total)}.`,
        });
        void pollPayment(res.orderId);
      } else if (res.mpesa === "not_configured") {
        delivery_anim.finish();
        toast.warning("Order saved — M-Pesa is in test mode", {
          description: "Your order is securely registered. Pay the rider upon delivery.",
        });
        clear();
        setTimeout(() => navigate({ to: "/account", search: { tab: "orders" } }), 1200);
      } else {
        delivery_anim.fail();
        toast.error("M-Pesa request failed", { description: res.message });
      }
    } catch (err) {
      delivery_anim.fail();
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 lg:px-10 lg:py-20">
      <div className="border-b border-border/70 pb-6">
        <p className="eyebrow">Secure Checkout</p>
        <h1 className="mt-2 font-serif text-4xl lg:text-6xl">Complete Your Order</h1>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Your shopping bag is empty.</p>
          <Button variant="gold" size="lux" className="mt-6" asChild>
            <Link to="/shop">Explore Collection</Link>
          </Button>
        </div>
      ) : signedIn === null ? (
        <p className="py-20 text-center text-sm text-muted-foreground">Loading checkout details…</p>
      ) : !signedIn ? (
        <div className="mx-auto mt-10 max-w-md border border-border/70 bg-card p-8 text-center shadow-lg">
          <h2 className="font-serif text-3xl">Sign in to Order</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Create or sign in to your free O&amp;N FITS account to track delivery live and save your
            shipping preferences.
          </p>
          <Button variant="gold" size="luxlg" className="mt-7 w-full" asChild>
            <Link to="/auth" search={{ next: "/checkout" }}>
              Sign in / Register
            </Link>
          </Button>
          <Button variant="lux" size="lux" className="mt-3 w-full" asChild>
            <Link to="/cart">Back to Bag</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            {/* Delivery Destination Section */}
            <fieldset className="border border-border/70 bg-card p-6 sm:p-8">
              <legend className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase font-medium px-2">
                1. Delivery Destination
              </legend>

              {/* County delivery badge */}
              <div className="mt-4 flex items-center gap-2 rounded bg-gold/10 px-3.5 py-2.5 text-xs text-foreground">
                <Truck className="size-4 text-gold shrink-0" />
                <span>
                  Delivery to <strong className="text-gold-deep">{selectedCounty}</strong>:{" "}
                  {countyData?.deliveryTime}
                </span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Maina"
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold"
                  />
                  {errors["fullName"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["fullName"]}</p>
                  ) : null}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Kenyan Phone (M-Pesa) *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678 or +254712345678"
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold"
                  />
                  {errors["phone"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["phone"]}</p>
                  ) : null}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold"
                  />
                  {errors["email"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
                  ) : null}
                </div>

                {/* County Selection */}
                <div>
                  <label
                    htmlFor="county"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    County (47 Counties) *
                  </label>
                  <select
                    id="county"
                    value={selectedCounty}
                    onChange={(e) => {
                      const newCounty = e.target.value;
                      setSelectedCounty(newCounty);
                      const c = findCounty(newCounty);
                      if (c?.towns[0]) setSelectedTown(c.towns[0]);
                    }}
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold cursor-pointer"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.deliveryTime})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Town / Area Selection */}
                <div>
                  <label
                    htmlFor="town"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Town / Area *
                  </label>
                  {countyData?.towns && countyData.towns.length > 0 ? (
                    <select
                      id="town"
                      value={selectedTown}
                      onChange={(e) => setSelectedTown(e.target.value)}
                      className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold cursor-pointer"
                    >
                      {countyData.towns.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="town"
                      type="text"
                      value={selectedTown}
                      onChange={(e) => setSelectedTown(e.target.value)}
                      className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold"
                    />
                  )}
                  {errors["town"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["town"]}</p>
                  ) : null}
                </div>

                {/* Specific Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Specific Street / Building / Apartment Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Parklands 4th Ave, Block B, Door 12"
                    className="mt-2 h-12 w-full border border-border bg-background px-4 text-sm outline-none focus:border-gold"
                  />
                  {errors["address"] ? (
                    <p className="mt-1 text-xs text-destructive">{errors["address"]}</p>
                  ) : null}
                </div>

                {/* Special Instructions */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="instructions"
                    className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    Rider Notes (Optional)
                  </label>
                  <textarea
                    id="instructions"
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Call upon arrival at the gate."
                    className="mt-2 w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>
            </fieldset>

            {/* Payment Method Section */}
            <fieldset className="border border-border/70 bg-card p-6 sm:p-8">
              <legend className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase font-medium px-2">
                2. Payment Method
              </legend>
              <div className="mt-4 space-y-3">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 border p-4 transition-all",
                      payment === m.id
                        ? "border-gold bg-gold/10 ring-1 ring-gold/40"
                        : "border-border hover:border-gold/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      className="mt-1 accent-[oklch(0.72_0.075_78)] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{m.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{m.hint}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Encrypted 256-bit SSL transaction verified by Safaricom Daraja M-Pesa.</span>
              </div>
            </fieldset>
          </div>

          {/* Right Column: Order Summary & Voucher */}
          <aside className="h-fit space-y-6">
            <div className="border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase font-semibold">
                Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>

              {/* Items List */}
              <ul className="mt-5 space-y-3 divide-y divide-border/50 text-sm">
                {items.map((i) => (
                  <li key={i.key} className="flex justify-between gap-3 pt-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{i.name}</p>
                      <p className="text-[0.65rem] text-muted-foreground">
                        Size {i.size} · {i.color} × {i.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold">{formatKES(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>

              {/* Promo Code Input */}
              <div className="mt-6 border-t border-border/70 pt-5">
                <p className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground font-medium">
                  <Tag className="size-3 text-gold" /> Promo Code
                </p>
                {appliedPromo ? (
                  <div className="mt-2 flex items-center justify-between rounded bg-gold/15 p-2.5 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-gold-deep" />
                      <div>
                        <span className="font-semibold">{appliedPromo.code}</span>
                        <span className="block text-[0.65rem] text-muted-foreground">
                          {appliedPromo.description}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-xs text-destructive hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ONFITS10"
                      className="flex-1 border border-border bg-background px-3 py-2 text-xs uppercase outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="border border-gold bg-gold/15 px-3 py-2 text-xs uppercase tracking-wider text-foreground hover:bg-gold hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Calculations */}
              <dl className="mt-6 space-y-3 border-t border-border/70 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatKES(subtotal)}</dd>
                </div>

                {discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <dt className="flex items-center gap-1">
                      <Tag className="size-3" /> Discount ({appliedPromo?.code})
                    </dt>
                    <dd className="font-semibold">- {formatKES(discountAmount)}</dd>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nationwide Delivery</dt>
                  <dd className="font-medium">
                    {effectiveDelivery === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      formatKES(effectiveDelivery)
                    )}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-border/70 pt-3 text-base font-semibold">
                  <dt>Grand Total</dt>
                  <dd className="text-lg text-gold-deep">{formatKES(finalTotal)}</dd>
                </div>
              </dl>

              <DeliveryButton stage={delivery_anim.stage} className="mt-6" />
            </div>
          </aside>
        </form>
      )}

      {/* Live STK Push Countdown Modal */}
      {stkPending ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md border border-gold/40 bg-card p-8 text-center shadow-2xl rounded-xs">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Clock className="size-10 animate-spin" style={{ animationDuration: "8s" }} />
            </div>

            <h3 className="mt-5 font-serif text-3xl">STK Push Sent</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check your phone. An M-Pesa prompt has been sent to{" "}
              <strong className="text-foreground">{phone}</strong> for{" "}
              <strong className="text-gold-deep">{formatKES(finalTotal)}</strong>.
            </p>

            {/* Countdown seconds indicator */}
            <div className="mt-6 rounded-lg bg-secondary/80 p-4">
              <div className="text-2xl font-bold text-foreground font-mono">{stkSecondsLeft}s</div>
              <p className="mt-1 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                Waiting for M-Pesa PIN confirmation...
              </p>
            </div>

            <ol className="mt-6 space-y-2 text-left text-xs text-muted-foreground border-t border-border/70 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>1. Unlock your phone to see the Safaricom STK prompt.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>2. Enter your secret M-Pesa PIN and press OK.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>3. Your order will confirm instantly on this screen.</span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setStkPending(false)}
              className="mt-6 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Cancel / Change Payment Method
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
