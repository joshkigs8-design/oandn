import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatKES } from "@/lib/catalog";
import { DELIVERY_FLAT, FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — O&N" },
      { name: "description", content: "Review the pieces in your O&N shopping bag." },
      { property: "og:title", content: "Your Bag — O&N" },
      { property: "og:description", content: "Review the pieces in your O&N shopping bag." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-14 lg:px-10 lg:py-20">
      <h1 className="font-serif text-4xl lg:text-6xl">Your Bag</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Button variant="gold" size="lux" className="mt-6" asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border/70 border-y border-border/70">
            {items.map((item) => (
              <li key={item.key} className="flex gap-5 py-6">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={160}
                  height={200}
                  className="h-32 w-24 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate font-sans text-sm text-foreground">
                        <Link to="/product/$slug" params={{ slug: item.slug }}>
                          {item.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
                        {item.size} · {item.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Remove ${item.name}`}
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" strokeWidth={1.4} />
                    </button>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="grid size-9 cursor-pointer place-items-center"
                      >
                        <Minus className="size-3" strokeWidth={1.5} />
                      </button>
                      <span className="w-9 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid size-9 cursor-pointer place-items-center"
                      >
                        <Plus className="size-3" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-sm">{formatKES(item.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border/70 bg-card p-6">
            <h2 className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase">
              Order Summary
            </h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatKES(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{delivery === 0 ? "Free" : formatKES(delivery)}</dd>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-3 text-base">
                <dt>Total</dt>
                <dd className="text-gold-deep">{formatKES(subtotal + delivery)}</dd>
              </div>
            </dl>
            <div className="mt-7 grid gap-3">
              <Button variant="gold" size="lux" asChild>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button variant="lux" size="lux" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
