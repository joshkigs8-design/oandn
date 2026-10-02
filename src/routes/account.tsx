import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Heart,
  LogOut,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  Shield,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/catalog";
import { KENYA_COUNTIES } from "@/lib/kenya-locations";
import { cn } from "@/lib/utils";

const accountSearchSchema = z.object({
  tab: z.enum(["orders", "wishlist", "addresses", "profile"]).optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: accountSearchSchema,
  head: () => ({
    meta: [
      { title: "My Account — O&N" },
      {
        name: "description",
        content: "Manage your O&N orders, saved wishlist and delivery preferences.",
      },
      { property: "og:title", content: "My Account — O&N" },
      {
        property: "og:description",
        content: "Manage your O&N orders, saved wishlist and delivery preferences.",
      },
      { property: "og:url", content: "/account" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
  component: AccountPage,
});

type CustomerOrder = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  county: string;
  town: string;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  mpesa_receipt_number: string | null;
  status: string;
};

async function fetchCustomerOrders(userId: string): Promise<CustomerOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomerOrder[];
}

function AccountPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const activeTab = search.tab ?? "orders";

  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem, openCart } = useCart();

  const [user, setUser] = useState<{ id: string; email?: string | undefined } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Saved Address Form State
  const [savedName, setSavedName] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [savedCounty, setSavedCounty] = useState("Nairobi");
  const [savedTown, setSavedTown] = useState("Kilimani");
  const [savedAddress, setSavedAddress] = useState("");
  const [selectedCustomerInvoice, setSelectedCustomerInvoice] = useState<CustomerOrder | null>(null);

  const handlePrintInvoice = (elementId: string, invoiceNum: string) => {
    const content = document.getElementById(elementId);
    if (!content) {
      window.print();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="${window.location.origin}/">
          <title>${invoiceNum} - O&N FITS</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #111827;
            }
            body {
              background: #ffffff;
              padding: 10px;
              font-size: 12px;
              line-height: 1.45;
            }
            .invoice-wrapper {
              max-width: 800px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background: #f4f4f5;
              padding: 8px 10px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              text-align: left;
              border-bottom: 2px solid #e4e4e7;
              color: #52525b;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #f4f4f5;
              font-size: 11px;
            }
            .border-b { border-bottom: 1px solid #e4e4e7; }
            .border-t { border-top: 1px solid #e4e4e7; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .text-muted { color: #71717a; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    };

    // Ensure all images (including logo.png) are loaded in the iframe before printing
    const imgs = Array.from(doc.images);
    if (imgs.length > 0) {
      let loaded = 0;
      const onDone = () => {
        loaded++;
        if (loaded >= imgs.length) setTimeout(triggerPrint, 150);
      };
      imgs.forEach((img) => {
        if (img.complete) {
          loaded++;
        } else {
          img.onload = onDone;
          img.onerror = onDone;
        }
      });
      if (loaded >= imgs.length) setTimeout(triggerPrint, 150);
    } else {
      setTimeout(triggerPrint, 300);
    }
  };

  useEffect(() => {
    try {
      const addr = localStorage.getItem("on-saved-address");
      if (addr) {
        const parsed = JSON.parse(addr);
        setSavedName(parsed.name ?? "");
        setSavedPhone(parsed.phone ?? "");
        setSavedCounty(parsed.county ?? "Nairobi");
        setSavedTown(parsed.town ?? "Kilimani");
        setSavedAddress(parsed.address ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (active) {
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }
      if (active) {
        setUser({ id: data.user.id, email: data.user.email });
        setAuthLoading(false);
      }
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (active) setIsAdmin(!!adminCheck);
    })();
    return () => {
      active = false;
    };
  }, []);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: () => (user ? fetchCustomerOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: savedName,
      phone: savedPhone,
      county: savedCounty,
      town: savedTown,
      address: savedAddress,
    };
    localStorage.setItem("on-saved-address", JSON.stringify(data));
    toast.success("Delivery preferences saved!");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast("Signed out of your account");
    navigate({ to: "/" });
  };

  const moveWishlistItemToBag = (p: (typeof wishlistItems)[0]) => {
    addItem({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.image,
      price: p.price,
      size: p.sizes[0] ?? "M",
      color: p.colors[0]?.name ?? "Default",
      quantity: 1,
    });
    toast.success("Moved to Bag", { description: p.name });
    removeFromWishlist(p.id);
    openCart();
  };

  if (authLoading) {
    return (
      <div className="py-32 text-center text-sm text-muted-foreground">
        Loading account details…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-24 lg:py-32">
        <GoldFlow className="opacity-40" />
        <div className="relative mx-auto max-w-md px-5 text-center">
          <p className="eyebrow">Customer Portal</p>
          <h1 className="mt-4 font-serif text-4xl lg:text-5xl">Access Your Account</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Sign in to track ongoing deliveries, view past orders, and manage your wishlist.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="gold" size="luxlg" asChild>
              <Link to="/auth" search={{ next: "/account" }}>
                Sign In / Register
              </Link>
            </Button>
            <Button variant="lux" size="lux" asChild>
              <Link to="/shop">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-12 lg:px-10 lg:py-16">
      {/* Account Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/70 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <p className="eyebrow">Welcome Back</p>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.65rem] font-semibold text-gold-deep">
                <Shield className="size-3" /> Store Administrator
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl text-foreground">
            {user.email?.split("@")[0]}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin ? (
            <Button variant="gold" size="lux" asChild>
              <Link to="/admin">
                <Shield className="mr-1.5 size-3.5" /> Admin Portal
              </Link>
            </Button>
          ) : null}
          <Button variant="lux" size="lux" onClick={handleSignOut}>
            <LogOut className="mr-1.5 size-3.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-8 flex overflow-x-auto border-b border-border/70 gap-2 pb-px">
        {[
          { id: "orders", label: "My Orders", icon: Package, count: orders.length },
          { id: "wishlist", label: "Saved Wishlist", icon: Heart, count: wishlistItems.length },
          { id: "addresses", label: "Delivery Address", icon: MapPin },
          { id: "profile", label: "Account Settings", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                navigate({
                  to: "/account",
                  search: { tab: tab.id as "orders" | "wishlist" | "addresses" | "profile" },
                })
              }
              className={cn(
                "flex items-center gap-2 border-b-2 px-5 py-3 text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer font-medium",
                isActive
                  ? "border-gold text-foreground bg-gold/5"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] text-foreground">
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === "orders" ? (
        <div className="mt-8 space-y-6">
          {ordersLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="border border-dashed border-border py-20 text-center p-6">
              <Package className="mx-auto size-8 text-gold opacity-60" />
              <h3 className="mt-4 font-serif text-2xl">No orders placed yet</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Your future O&amp;N FITS orders and M-Pesa receipts will appear right here.
              </p>
              <Button variant="gold" size="lux" className="mt-6" asChild>
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items)
                  ? (order.items as Array<{
                      name?: string;
                      quantity?: number;
                      size?: string;
                      color?: string;
                      price?: number;
                      image?: string;
                    }>)
                  : [];

                return (
                  <div
                    key={order.id}
                    className="border border-border/80 bg-card p-6 shadow-sm rounded-xs"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-4">
                      <div>
                        <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                          Order Reference
                        </span>
                        <p className="font-mono text-sm font-semibold text-foreground">
                          ON-{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            dateStyle: "long",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Status Pill */}
                        <OrderStatusBadge status={order.status} />
                        {order.mpesa_receipt_number ? (
                          <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                            M-Pesa: {order.mpesa_receipt_number}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="mt-5 space-y-4">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name ?? "Product"}
                                className="size-12 object-cover rounded-xs border border-border"
                              />
                            ) : null}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Size: {item.size ?? "M"} · Color: {item.color ?? "Default"} ×{" "}
                                {item.quantity ?? 1}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {item.price && item.quantity
                              ? formatKES(item.price * item.quantity)
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer / Total & Destination */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-4 text-xs">
                      <div className="text-muted-foreground">
                        <span>Delivering to: </span>
                        <strong className="text-foreground">
                          {order.address}, {order.town}, {order.county}
                        </strong>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomerInvoice(order)}
                          className="h-8 text-xs gap-1.5 border-gold/40 text-gold-deep hover:bg-gold/10"
                        >
                          <FileText className="size-3.5" />
                          <span>View Invoice / PDF</span>
                        </Button>
                        <div className="text-sm">
                          <span className="text-muted-foreground mr-1.5">Total:</span>
                          <strong className="text-base text-gold-deep">
                            {formatKES(order.total)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 2: Saved Wishlist */}
      {activeTab === "wishlist" ? (
        <div className="mt-8">
          {wishlistItems.length === 0 ? (
            <div className="border border-dashed border-border py-20 text-center p-6">
              <Heart className="mx-auto size-8 text-gold opacity-60" />
              <h3 className="mt-4 font-serif text-2xl">Your wishlist is empty</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Save pieces you love by tapping the heart icon on any product.
              </p>
              <Button variant="gold" size="lux" className="mt-6" asChild>
                <Link to="/shop">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "piece" : "pieces"} saved
                </p>
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="text-xs uppercase tracking-wider text-destructive hover:underline cursor-pointer"
                >
                  Clear Wishlist
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="group relative border border-border bg-card p-3 rounded-xs"
                  >
                    <Link to="/product/$slug" params={{ slug: product.slug }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="aspect-[4/5] w-full object-cover rounded-xs"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label="Remove from wishlist"
                      className="absolute top-5 right-5 grid size-8 place-items-center bg-card/90 text-destructive rounded-full shadow"
                    >
                      <X className="size-3.5" />
                    </button>
                    <div className="mt-3">
                      <h4 className="truncate text-xs font-medium text-foreground">
                        {product.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-gold-deep">{formatKES(product.price)}</p>
                      <Button
                        variant="gold"
                        size="lux"
                        className="mt-3 w-full text-[0.65rem]"
                        onClick={() => moveWishlistItemToBag(product)}
                      >
                        <ShoppingBag className="mr-1 size-3" /> Move to Bag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Tab 3: Saved Delivery Address */}
      {activeTab === "addresses" ? (
        <div className="mt-8 max-w-xl">
          <form
            onSubmit={saveAddress}
            className="border border-border/70 bg-card p-7 space-y-5 rounded-xs shadow-sm"
          >
            <h3 className="font-serif text-2xl">Default Shipping Address</h3>
            <p className="text-xs text-muted-foreground">
              Save your address here to automatically pre-populate details at checkout.
            </p>

            <div>
              <label className="text-[0.62rem] tracking-wider uppercase text-muted-foreground">
                Recipient Name
              </label>
              <input
                type="text"
                value={savedName}
                onChange={(e) => setSavedName(e.target.value)}
                placeholder="Full Name"
                className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[0.62rem] tracking-wider uppercase text-muted-foreground">
                Kenyan Phone
              </label>
              <input
                type="tel"
                value={savedPhone}
                onChange={(e) => setSavedPhone(e.target.value)}
                placeholder="0712345678"
                className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[0.62rem] tracking-wider uppercase text-muted-foreground">
                  County
                </label>
                <select
                  value={savedCounty}
                  onChange={(e) => setSavedCounty(e.target.value)}
                  className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold cursor-pointer"
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[0.62rem] tracking-wider uppercase text-muted-foreground">
                  Town / Area
                </label>
                <input
                  type="text"
                  value={savedTown}
                  onChange={(e) => setSavedTown(e.target.value)}
                  placeholder="e.g. Kilimani"
                  className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.62rem] tracking-wider uppercase text-muted-foreground">
                Street / Building Address
              </label>
              <input
                type="text"
                value={savedAddress}
                onChange={(e) => setSavedAddress(e.target.value)}
                placeholder="Apartment, Suite, Unit, Street"
                className="mt-1.5 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
              />
            </div>

            <Button type="submit" variant="gold" size="lux" className="w-full">
              Save Preferences
            </Button>
          </form>
        </div>
      ) : null}

      {/* Tab 4: Account Settings */}
      {activeTab === "profile" ? (
        <div className="mt-8 max-w-lg space-y-6">
          <div className="border border-border/70 bg-card p-6 space-y-4 rounded-xs shadow-sm">
            <h3 className="font-serif text-2xl">Security &amp; Account</h3>
            <div className="text-sm">
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                Email
              </span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                Account ID
              </span>
              <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
            </div>
            <div className="pt-4 border-t border-border/70">
              <Button
                variant="lux"
                size="lux"
                onClick={async () => {
                  if (!user.email) return;
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent to your inbox");
                }}
              >
                Send Password Reset Link
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Customer Commercial Tax Invoice Modal */}
      {selectedCustomerInvoice ? (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="my-8 w-full max-w-3xl rounded-xs border border-border/80 bg-background shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-border/80 bg-secondary/50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <FileText className="size-5 text-gold" />
                <span className="font-serif text-sm font-semibold tracking-wide text-foreground">
                  Order Invoice — ON-{selectedCustomerInvoice.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() =>
                    handlePrintInvoice(
                      "on-customer-invoice-content",
                      `INV-ON-${selectedCustomerInvoice.id.slice(0, 8).toUpperCase()}`,
                    )
                  }
                  className="h-8 gap-1.5 text-xs font-medium shadow-sm"
                >
                  <Download className="size-3.5" />
                  <span>Download / Print PDF</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomerInvoice(null)}
                  className="grid size-8 place-items-center rounded-xs text-muted-foreground hover:bg-background hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close invoice preview"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Invoice Content */}
            <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto">
              <div
                id="on-customer-invoice-content"
                className="bg-white text-zinc-900 p-8 sm:p-10 border border-zinc-200 rounded-xs shadow-sm font-sans"
              >
                {/* Invoice Header */}
                <div className="flex flex-wrap items-start justify-between gap-6 border-b border-zinc-200 pb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src="/logo.png"
                      alt="O&N FITS"
                      className="h-14 w-auto object-contain"
                    />
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-950">
                        O&amp;N FITS APPAREL LTD.
                      </h2>
                      <p className="text-[0.7rem] uppercase tracking-wider text-zinc-500 font-medium">
                        Luxury Streetwear &amp; Bespoke Ready-to-Wear
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Eldoret, Kenya • oandnfits23@gmail.com • +254 112 854 091
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block rounded-xs bg-zinc-900 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-white mb-2">
                      Commercial Tax Invoice
                    </span>
                    <p className="font-mono text-sm font-bold text-zinc-900">
                      INV-ON-{selectedCustomerInvoice.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Date:{" "}
                      {new Date(selectedCustomerInvoice.created_at).toLocaleDateString("en-KE", {
                        dateStyle: "medium",
                      })}
                    </p>
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                          selectedCustomerInvoice.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        Payment: {selectedCustomerInvoice.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Shipping Address Grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-zinc-200 pb-6">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block mb-1">
                      Customer / Billed To
                    </span>
                    <p className="font-bold text-sm text-zinc-950">
                      {selectedCustomerInvoice.full_name}
                    </p>
                    <p className="text-zinc-700 mt-0.5 font-medium">
                      Phone: {selectedCustomerInvoice.phone}
                    </p>
                    <p className="text-zinc-600">{selectedCustomerInvoice.email}</p>
                  </div>

                  <div>
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block mb-1">
                      Courier Dispatch Address
                    </span>
                    <p className="text-zinc-800 font-medium">{selectedCustomerInvoice.address}</p>
                    <p className="text-zinc-600">
                      {selectedCustomerInvoice.town}, {selectedCustomerInvoice.county} County
                    </p>
                    <p className="text-zinc-500">Republic of Kenya</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mt-6">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-200 bg-zinc-50 text-[0.65rem] uppercase tracking-wider font-semibold text-zinc-600">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Size</th>
                        <th className="py-2.5 px-3 text-center">Color</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(Array.isArray(selectedCustomerInvoice.items)
                        ? (selectedCustomerInvoice.items as Array<{
                            name?: string;
                            size?: string;
                            color?: string;
                            quantity?: number;
                            price?: number;
                          }>)
                        : []
                      ).map((item, idx) => {
                        const qty = item.quantity ?? 1;
                        const unitPrice = item.price ?? 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="py-3 px-3 font-medium text-zinc-900">
                              {item.name || "O&N Apparel Piece"}
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-600 font-mono">
                              {item.size ?? "M"}
                            </td>
                            <td className="py-3 px-3 text-center text-zinc-600">
                              {item.color ?? "Standard"}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-700">
                              {formatKES(unitPrice)}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-zinc-900">
                              {qty}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-zinc-950">
                              {formatKES(unitPrice * qty)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals Breakdown */}
                <div className="mt-6 flex flex-wrap justify-between items-start gap-6 border-t border-zinc-200 pt-6">
                  <div className="max-w-xs text-xs space-y-2">
                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-zinc-400 block">
                      Payment Reconciliation
                    </span>
                    <div className="rounded-xs bg-zinc-50 p-3 border border-zinc-200/80 space-y-1">
                      <p className="text-zinc-700">
                        <span className="font-semibold">Payment:</span>{" "}
                        {selectedCustomerInvoice.payment_method.toUpperCase() === "MPESA"
                          ? "M-PESA (Till: 1673504)"
                          : "Call to Confirm / On Delivery"}
                      </p>
                      <p className="text-zinc-700">
                        <span className="font-semibold">Till Number:</span>{" "}
                        <strong className="text-emerald-700 font-mono">1673504 (O&amp;N FITS)</strong>
                      </p>
                      {selectedCustomerInvoice.mpesa_receipt_number ? (
                        <p className="text-zinc-900 font-mono">
                          <span className="font-semibold font-sans">M-Pesa Ref:</span>{" "}
                          <strong className="text-emerald-700">
                            {selectedCustomerInvoice.mpesa_receipt_number}
                          </strong>
                        </p>
                      ) : (
                        <p className="text-zinc-500 italic">
                          Awaiting payment or owner call confirmation
                        </p>
                      )}
                      <p className="text-zinc-600">
                        <span className="font-semibold">Dispatch Status:</span>{" "}
                        {selectedCustomerInvoice.status.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal:</span>
                      <span className="font-medium text-zinc-900">
                        {formatKES(selectedCustomerInvoice.subtotal || selectedCustomerInvoice.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Courier Delivery Fee:</span>
                      <span className="font-medium text-zinc-900">
                        {selectedCustomerInvoice.delivery_fee > 0
                          ? formatKES(selectedCustomerInvoice.delivery_fee)
                          : "Free Delivery"}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[0.7rem]">
                      <span>VAT (16% Included):</span>
                      <span>
                        {formatKES(Math.round((selectedCustomerInvoice.total * 16) / 116))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t-2 border-zinc-900 pt-2 text-base font-bold text-zinc-950">
                      <span>Grand Total:</span>
                      <span>{formatKES(selectedCustomerInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Terms & Sign-off */}
                <div className="mt-8 border-t border-zinc-200 pt-6 text-[0.7rem] text-zinc-500 flex flex-wrap justify-between items-end gap-4">
                  <div>
                    <p className="font-semibold text-zinc-700">
                      Thank you for choosing O&amp;N FITS Kenya.
                    </p>
                    <p className="mt-0.5">
                      Pieces can be exchanged within 7 days in original unworn condition with tags attached.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif italic font-semibold text-zinc-800">
                      Authorized Executive Dispatch
                    </p>
                    <p className="text-[0.65rem] text-zinc-400">O&amp;N FITS • All Rights Reserved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Close Bar */}
            <div className="flex justify-end gap-3 border-t border-border/80 bg-secondary/50 px-6 py-3">
              <Button
                variant="lux"
                size="sm"
                onClick={() => setSelectedCustomerInvoice(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold uppercase rounded">
          <CheckCircle2 className="size-3" /> Confirmed
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2.5 py-1 text-xs font-semibold uppercase rounded">
          <Truck className="size-3" /> In Transit
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 bg-purple-500/15 text-purple-700 dark:text-purple-400 px-2.5 py-1 text-xs font-semibold uppercase rounded">
          <Package className="size-3" /> Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 bg-destructive/15 text-destructive px-2.5 py-1 text-xs font-semibold uppercase rounded">
          <X className="size-3" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-xs font-semibold uppercase rounded">
          <Clock className="size-3" /> Pending Dispatch
        </span>
      );
  }
}
