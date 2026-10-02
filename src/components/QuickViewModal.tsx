import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, Heart, ArrowRight } from "lucide-react";
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

  // Lock background scrolling and handle Escape key
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  // Reset local state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setSelectedColorIndex(0);
      setQuantity(1);
    }
  }, [product]);

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
      color: activeColor?.name ?? "Standard",
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
      aria-label={`Quick View: ${product.name}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-3xl my-auto bg-card border border-border shadow-2xl rounded-xs overflow-hidden max-h-[92vh] flex flex-col md:grid md:grid-cols-[1.1fr_1.3fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close Quick View"
          className="absolute top-3 right-3 z-30 grid size-8 sm:size-9 place-items-center rounded-full bg-background/90 text-foreground border border-border hover:bg-secondary hover:text-gold-deep backdrop-blur-md cursor-pointer transition-colors shadow-md"
        >
          <X className="size-4" />
        </button>

        {/* Left Column: Product Image */}
        <div className="relative w-full bg-secondary overflow-hidden shrink-0 h-64 sm:h-72 md:h-full min-h-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-top"
          />
          {product.isNew ? (
            <span className="absolute top-3 left-3 z-10 bg-gold px-2.5 py-1 text-[0.55rem] tracking-widest text-primary-foreground uppercase font-bold shadow-sm">
              New Season
            </span>
          ) : null}
        </div>

        {/* Right Column: Product Details & Purchase Form */}
        <div className="flex flex-col flex-1 p-5 sm:p-7 md:p-8 overflow-y-auto min-w-0 max-h-[92vh] justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.62rem] uppercase tracking-widest text-gold-deep font-semibold">
                {product.category}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                Authentic O&amp;N FITS
              </span>
            </div>

            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl text-foreground font-normal leading-tight">
              {product.name}
            </h2>

            <p className="mt-2 text-xl font-bold text-foreground font-sans">
              {formatKES(product.price)}
            </p>

            <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Colour Swatches */}
            {product.colors.length > 0 ? (
              <div className="mt-5">
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  Colour: <strong className="text-foreground">{activeColor?.name}</strong>
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
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
                      aria-label={`Select colour ${c.name}`}
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

            {/* Quantity Selector */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                Quantity:
              </span>
              <div className="flex items-center border border-border rounded-xs bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-xs text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-xs text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-4 border-t border-border/60 space-y-3">
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
                title="Save to Wishlist"
                aria-label="Toggle Wishlist"
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
                className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground hover:text-gold-deep transition-colors font-medium"
              >
                View Full Product Details &amp; Gallery <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
