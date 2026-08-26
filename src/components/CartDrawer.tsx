import { Link } from "@tanstack/react-router";
import { CheckCircle2, Minus, Plus, ShoppingBag, Sparkles, Truck, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/catalog";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal } = useCart();
  const remainingForFreeShipping = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <div
      className={cn("fixed inset-0 z-[60]", isOpen ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        aria-label="Shopping bag"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[image:var(--gradient-ivory)] shadow-[var(--shadow-lift)] transition-transform duration-500 [transition-timing-function:var(--ease-lux)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl">Your Bag</h2>
            {items.length > 0 ? (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold-deep">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="grid size-9 cursor-pointer place-items-center text-foreground hover:text-gold-deep"
          >
            <X className="size-5" strokeWidth={1.4} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {items.length > 0 ? (
          <div className="border-b border-border/60 bg-background/60 px-6 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Truck className="size-3.5 text-gold" />
                {remainingForFreeShipping === 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="size-3.5" /> FREE Nationwide Delivery Unlocked!
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong className="text-gold-deep">
                      {formatKES(remainingForFreeShipping)}
                    </strong>{" "}
                    for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[0.65rem] text-muted-foreground">{freeShippingProgress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full bg-[image:var(--gradient-gold)] transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-champagne/40">
              <ShoppingBag className="size-8 text-gold" strokeWidth={1.2} />
            </div>
            <div>
              <p className="font-serif text-xl">Your bag is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore our signature drops and elevated everyday essentials.
              </p>
            </div>
            <Button variant="gold" size="lux" asChild onClick={closeCart}>
              <Link to="/shop">
                <Sparkles className="mr-1.5 size-3.5" /> Explore Collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border/60 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    onClick={closeCart}
                    className="block shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      width={160}
                      height={200}
                      className="h-24 w-20 shrink-0 object-cover rounded-xs"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to="/product/$slug"
                        params={{ slug: item.slug }}
                        onClick={closeCart}
                        className="truncate text-sm font-medium text-foreground hover:text-gold-deep"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-4" strokeWidth={1.4} />
                      </button>
                    </div>
                    <p className="mt-1 text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                      Size: {item.size} · Color: {item.color}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border bg-card">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="grid size-8 cursor-pointer place-items-center text-foreground hover:bg-secondary transition-colors"
                        >
                          <Minus className="size-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="grid size-8 cursor-pointer place-items-center text-foreground hover:bg-secondary transition-colors"
                        >
                          <Plus className="size-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatKES(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border/70 bg-card/60 px-6 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="tracking-[0.16em] text-muted-foreground uppercase text-xs">
                  Subtotal
                </span>
                <span className="text-base font-semibold text-foreground">
                  {formatKES(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {subtotal >= FREE_DELIVERY_THRESHOLD
                  ? "Standard nationwide delivery included."
                  : "Nationwide delivery KES 350 calculated at checkout."}
              </p>
              <div className="mt-5 grid gap-2.5">
                <Button variant="gold" size="luxlg" asChild onClick={closeCart}>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="lux" size="lux" asChild onClick={closeCart}>
                  <Link to="/cart">View Shopping Bag</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
