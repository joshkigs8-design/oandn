import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatKES, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { QuickViewModal } from "@/components/QuickViewModal";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  layout = "standard",
}: {
  product: Product;
  layout?: "standard" | "compact" | "editorial";
}) {
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [colorIndex, setColorIndex] = useState(0);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const singleSize = product.sizes.length === 1;
  const activeColor = product.colors[colorIndex] ?? product.colors[0];
  const wishlisted = isInWishlist(product.id);

  const quickAdd = () => {
    if (!product.inStock) return;
    if (!singleSize) {
      toast("Choose a size", { description: "Select your size on the product page." });
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      size: product.sizes[0]!,
      color: activeColor?.name ?? "Default",
      quantity: 1,
    });
    toast.success("Added to Bag", { description: `${product.name} (${product.sizes[0]})` });
    openCart();
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    if (wishlisted) {
      toast("Removed from Wishlist", { description: product.name });
    } else {
      toast.success("Saved to Wishlist", { description: product.name });
    }
  };

  return (
    <article className="group relative flex flex-col">
      <div
        className="relative overflow-hidden bg-champagne/40 transition-shadow duration-700 rounded-xs"
        style={
          activeColor
            ? {
                backgroundColor: `color-mix(in oklab, ${activeColor.hex} 18%, transparent)`,
                boxShadow: `0 18px 60px -24px color-mix(in oklab, ${activeColor.hex} 85%, transparent)`,
              }
            : undefined
        }
      >
        {activeColor ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 opacity-70 mix-blend-soft-light transition-all duration-700"
            style={{
              background: `radial-gradient(120% 80% at 50% 100%, ${activeColor.hex} 0%, transparent 65%)`,
            }}
          />
        ) : null}

        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          aria-label={product.name}
          className="block"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className={cn(
              "w-full object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.05]",
              layout === "editorial" ? "aspect-[3/4]" : "aspect-[4/5]",
            )}
          />
        </Link>

        {product.isNew ? (
          <span className="absolute top-3 left-3 bg-[image:var(--gradient-gold)] px-2.5 py-1 text-[0.55rem] tracking-[0.22em] text-primary-foreground uppercase font-medium shadow-sm">
            New
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute top-3 left-3 bg-ink/85 px-2.5 py-1 text-[0.55rem] tracking-[0.22em] text-ivory uppercase">
            Sold out
          </span>
        ) : null}

        {/* Wishlist Button with persistent state */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={
            wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          className={cn(
            "absolute top-3 right-3 grid size-9 cursor-pointer place-items-center bg-card/85 text-foreground backdrop-blur-sm transition-all duration-300",
            wishlisted
              ? "opacity-100 ring-1 ring-gold/40"
              : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              wishlisted ? "fill-gold text-gold scale-110" : "text-foreground hover:text-gold",
            )}
            strokeWidth={1.4}
          />
        </button>

        {/* Quick Add & Quick View overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 [transition-timing-function:var(--ease-lux)] group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100 flex items-center gap-1.5">
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 bg-card/95 py-2.5 text-[0.6rem] tracking-[0.18em] text-foreground uppercase backdrop-blur-sm transition-colors hover:bg-card hover:border-gold border border-transparent disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            <ShoppingBag className="size-3.5" strokeWidth={1.4} />
            {product.inStock ? (singleSize ? "Quick add" : "Select size") : "Sold out"}
          </button>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            title="Quick View"
            aria-label={`Quick View ${product.name}`}
            className="grid size-9 shrink-0 cursor-pointer place-items-center bg-card/95 text-foreground backdrop-blur-sm hover:border-gold border border-transparent transition-colors hover:text-gold-deep shadow-sm"
          >
            <Eye className="size-3.5" strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div className="pt-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-sans text-sm font-normal tracking-wide text-foreground">
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="hover:text-gold-deep transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {formatKES(product.price)}
          </p>
        </div>

        <div>
          {product.colors.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onMouseEnter={() => setColorIndex(i)}
                  onFocus={() => setColorIndex(i)}
                  onClick={() => setColorIndex(i)}
                  aria-label={c.name}
                  aria-pressed={i === colorIndex}
                  title={c.name}
                  className={cn(
                    "size-4 cursor-pointer rounded-full border transition-all duration-300",
                    i === colorIndex
                      ? "border-gold ring-2 ring-gold/40 scale-110"
                      : "border-border hover:border-gold/60",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          ) : null}
          <p className="mt-2 text-[0.62rem] tracking-[0.18em] text-muted-foreground/80 uppercase">
            {product.sizes.join(" · ")}
          </p>
        </div>
      </div>

      <QuickViewModal product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </article>
  );
}
