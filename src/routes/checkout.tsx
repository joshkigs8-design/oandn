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
  TILL_NUMBER,
  type PaymentMethod,
} from "@/lib/checkout";
import { KENYA_COUNTIES, findCounty } from "@/lib/kenya-locations";
import { applyDiscount, type DiscountCode } from "@/lib/discounts";
import { cn } from "@/lib/utils";
import { placeOrder } from "@/lib/orders.functions";
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
  const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    total: number;
    phone: string;
    receiptNumber?: string | null;
  } | null>(null);

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<DiscountCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const delivery_anim = useDeliverySequence();
  const submitOrder = useServerFn(placeOrder);

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
      mpesaReceiptNumber: mpesaReceiptNumber.trim(),
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

      delivery_anim.finish();
      clear();
      setConfirmedOrder({
        id: res.orderId,
        total: res.total,
        phone,
        receiptNumber: res.receiptNumber,
      });
      toast.success("Order Placed Successfully!", {
        description: "The owner will call you to confirm dispatch, or you can pay via Till 1673504.",
      });
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
        <div className="mx-auto mt-10 max-w-lg border border-border/70 bg-card p-8 sm:p-10 text-center shadow-lg">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold/15 text-gold-deep mb-4">
            <ShieldCheck className="size-6" />
          </div>
          <p className="eyebrow text-gold-deep">Customer Authentication Required</p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Sign Up Before Checkout</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            To guarantee instant M-Pesa payment reconciliation, live Nairobi same-day dispatch updates,
            and order tracking, all customers must sign up or sign in before placing an order.
          </p>
          <div className="mt-8 grid gap-3">
            <Button variant="gold" size="luxlg" className="w-full" asChild>
              <Link to="/auth" search={{ next: "/checkout", mode: "signup" }}>
                Create Customer Account (Sign Up)
              </Link>
            </Button>
            <Button variant="lux" size="luxlg" className="w-full" asChild>
              <Link to="/auth" search={{ next: "/checkout", mode: "signin" }}>
                Already have an account? Sign In
              </Link>
            </Button>
            <Button variant="ghost" size="lux" className="w-full text-muted-foreground" asChild>
              <Link to="/cart">← Return to Shopping Bag</Link>
            </Button>
          </div>
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
                      "flex cursor-pointer items-start gap-4 border p-4 transition-all rounded-xs",
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

              {/* M-Pesa Buy Goods Till 1673504 Interactive Card */}
              {payment === "mpesa" && (
                <div className="mt-5 rounded-xs border border-emerald-500/40 bg-emerald-500/5 p-4 sm:p-5 space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-emerald-600 font-bold text-sm text-white shadow-sm">
                        M
                      </span>
                      <div>
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                          Safaricom Lipa Na M-PESA
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground">
                          Buy Goods Till: <span className="font-mono text-emerald-700 dark:text-emerald-400">{TILL_NUMBER}</span>
                        </span>
                        <span className="block text-[0.65rem] text-muted-foreground">
                          Registered Business: <strong>O&amp;N FITS</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(TILL_NUMBER);
                        toast.success("Till Number 1673504 copied to clipboard!");
                      }}
                      className="rounded-xs border border-emerald-600/40 bg-background px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                    >
                      Copy Till: 1673504
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1.5">
                    <p>
                      1. Open <strong>M-PESA</strong> on your phone &gt; Select <strong>Lipa na M-PESA</strong>.
                    </p>
                    <p>
                      2. Select <strong>Buy Goods and Services</strong> &gt; Enter Till Number:{" "}
                      <strong className="text-foreground font-mono">{TILL_NUMBER}</strong>.
                    </p>
                    <p>
                      3. Enter Exact Amount: <strong className="text-gold-deep font-semibold">{formatKES(finalTotal)}</strong> and enter your PIN.
                    </p>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-3">
                    <label
                      htmlFor="mpesa-code"
                      className="block text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                    >
                      M-PESA Confirmation Code (Optional if paid now)
                    </label>
                    <input
                      id="mpesa-code"
                      type="text"
                      value={mpesaReceiptNumber}
                      onChange={(e) => setMpesaReceiptNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. SK4829J10K (leave blank if waiting to be called)"
                      className="h-11 w-full border border-border bg-background px-3.5 font-mono text-xs outline-none focus:border-gold uppercase text-foreground placeholder:normal-case"
                    />
                  </div>

                  <div className="rounded-xs bg-gold/10 border border-gold/30 p-3 text-[0.72rem] text-foreground leading-relaxed flex items-start gap-2">
                    <Info className="size-4 shrink-0 text-gold-deep mt-0.5" />
                    <span>
                      <strong>Flexible Checkout:</strong> You can pay now to Till <strong>{TILL_NUMBER}</strong> and enter your code above, OR place your order right now and our owner will call you directly to verify sizes and confirm dispatch payment!
                    </span>
                  </div>
                </div>
              )}

              {/* Call to Confirm Note */}
              {payment === "cod" && (
                <div className="mt-5 rounded-xs border border-gold/40 bg-gold/5 p-4 text-xs text-foreground leading-relaxed space-y-1">
                  <p className="font-semibold text-gold-deep">Owner Will Call You Directly</p>
                  <p className="text-muted-foreground">
                    Your order is reserved immediately. The owner will call you on your phone to confirm your exact sizes, fit, and delivery arrangement before dispatch.
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Direct Executive Fulfillment • All deliveries dispatched from Nairobi headquarters.</span>
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

      {/* Order Confirmation Modal for Manual Till 1673504 & Owner Call */}
      {confirmedOrder ? (
        <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-xs border border-gold/40 bg-card p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <p className="eyebrow text-gold-deep">Order Placed Successfully</p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">Thank You For Your Order!</h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Reference: ON-{confirmedOrder.id.slice(0, 8).toUpperCase()}
            </p>

            <div className="my-6 rounded-xs border border-border/80 bg-secondary/40 p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Total Order Amount:</span>
                <span className="font-bold text-foreground text-sm">{formatKES(confirmedOrder.total)}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Lipa na M-PESA Till:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">{TILL_NUMBER} (O&amp;N FITS)</span>
              </div>
              {confirmedOrder.receiptNumber ? (
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">M-Pesa Reference:</span>
                  <span className="font-mono text-emerald-600 font-semibold">{confirmedOrder.receiptNumber}</span>
                </div>
              ) : null}
              <div className="pt-1 text-muted-foreground leading-relaxed">
                <strong className="block text-foreground mb-1">What Happens Next?</strong>
                <span>
                  The owner will call you shortly on <strong className="text-foreground">{confirmedOrder.phone}</strong> to confirm your purchase, check your fit, and arrange delivery. You can also pay right now to Till <strong className="font-mono text-foreground">{TILL_NUMBER}</strong> and wait for your order.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="gold"
                size="lux"
                className="flex-1"
                onClick={() => navigate({ to: "/account", search: { tab: "orders" } })}
              >
                Track Order &amp; Invoice
              </Button>
              <Button
                variant="lux"
                size="lux"
                className="flex-1"
                onClick={() => navigate({ to: "/shop" })}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
