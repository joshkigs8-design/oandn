import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, Heart, Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatKES, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

type QuickViewModalProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!open || !product) return null;

  const currentSize = selectedSize || product.sizes[0] || "M";
  const activeColor = product.colors[selectedColorIndex] ?? product.colors[0];
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      size: currentSize,
      color: activeColor?.name ?? "Default",
      quantity,
    });
    toast.success("Added to Bag", {
      description: `${product.name} (${currentSize}, ${activeColor?.name ?? "Standard"}) × ${quantity}`,
    });
    onOpenChange(false);
    openCart();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-md animate-in fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden border border-border/80 bg-card shadow-2xl rounded-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 grid size-8 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-foreground cursor-pointer border border-border"
        >
          <X className="size-4" />
        </button>

        <div className="grid sm:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative aspect-[4/5] bg-secondary sm:h-full overflow-hidden">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            {product.isNew ? (
              <span className="absolute top-3 left-3 bg-gold px-2.5 py-1 text-[0.55rem] tracking-widest text-primary-foreground uppercase font-bold">
                New Season
              </span>
            ) : null}
          </div>

          {/* Right: Product Details & Fast Purchase */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-semibold">
                {product.category}
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-foreground">
                {product.name}
              </h2>
              <p className="mt-2 text-lg font-bold text-foreground">{formatKES(product.price)}</p>

              <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Color Swatches */}
              {product.colors.length > 0 ? (
                <div className="mt-5">
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                    Colour: <strong className="text-foreground">{activeColor?.name}</strong>
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    {product.colors.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColorIndex(i)}
                        className={cn(
                          "size-6 rounded-full border-2 transition-all cursor-pointer",
                          i === selectedColorIndex
                            ? "border-gold ring-2 ring-gold/40 scale-110"
                            : "border-border hover:border-gold/60",
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Size Selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                    Size: <strong className="text-foreground">{currentSize}</strong>
                  </span>
                  <span className="text-[0.6rem] text-gold-deep">True to Size</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "min-w-[42px] border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer",
                        currentSize === s
                          ? "border-gold bg-gold text-primary-foreground"
                          : "border-border text-foreground hover:border-gold",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  Qty:
                </span>
                <div className="flex items-center border border-border rounded-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-xs text-foreground hover:bg-secondary cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-xs text-foreground hover:bg-secondary cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xs bg-gold py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-deep transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  <ShoppingBag className="size-4" />
                  {product.inStock ? "Add to Bag" : "Sold Out"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product);
                    toast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist");
                  }}
                  className="grid size-11 place-items-center rounded-xs border border-border bg-background text-foreground hover:border-gold transition-colors cursor-pointer"
                  title="Wishlist"
                >
                  <Heart
                    className={cn("size-4", wishlisted ? "fill-gold text-gold" : "text-foreground")}
                  />
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground hover:text-gold-deep transition-colors"
                >
                  View Full Product Details <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
