import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Copy,
  Heart,
  Maximize2,
  MessageCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SizeGuideDialog } from "@/components/SizeGuideDialog";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { formatKES, getProduct, type Product } from "@/lib/catalog";
import { useProducts } from "@/lib/use-products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found — O&N" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — O&N` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — O&N` },
        { property: "og:description", content: product.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            brand: { "@type": "Brand", name: "O&N" },
            offers: {
              "@type": "Offer",
              priceCurrency: "KES",
              price: product.price,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-32 text-center">
      <h1 className="font-serif text-4xl">Piece not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">This product is no longer available.</p>
      <Button variant="lux" size="lux" className="mt-8" asChild>
        <Link to="/shop">Back to shop</Link>
      </Button>
    </div>
  );
}

function ProductPage() {
  const { product: fallbackProduct } = Route.useLoaderData() as { product: Product };
  const products = useProducts();
  const product = products.find((p) => p.slug === fallbackProduct.slug) ?? fallbackProduct;
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? (product.sizes[0] ?? null) : null,
  );
  const [color, setColor] = useState(product.colors[0]?.name ?? "Default");
  const activeSwatch = product.colors.find((c) => c.name === color) ?? product.colors[0];
  const [qty, setQty] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("craftsmanship");

  const { addRecentlyViewed } = useRecentlyViewed();
  useEffect(() => {
    if (product) addRecentlyViewed(product);
  }, [product, addRecentlyViewed]);

  const wishlisted = isInWishlist(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const add = () => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      size,
      color,
      quantity: qty,
    });
    toast.success("Added to Bag", { description: `${product.name} (${size} · ${color})` });
    openCart();
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    if (wishlisted) {
      toast("Removed from wishlist", { description: product.name });
    } else {
      toast.success("Saved to wishlist", { description: product.name });
    }
  };

  const copyProductLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Product link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out the ${product.name} on O&N FITS (${formatKES(product.price)}): ${window.location.href}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <>
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-16">
        {/* Left column: Gallery */}
        <div>
          <div
            className="group relative overflow-hidden bg-champagne/40 transition-all duration-700 rounded-xs cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
            style={
              activeSwatch
                ? {
                    backgroundColor: `color-mix(in oklab, ${activeSwatch.hex} 18%, transparent)`,
                    boxShadow: `0 30px 90px -30px color-mix(in oklab, ${activeSwatch.hex} 90%, transparent)`,
                  }
                : undefined
            }
          >
            {activeSwatch ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 opacity-70 mix-blend-soft-light transition-all duration-700"
                style={{
                  background: `radial-gradient(120% 80% at 50% 100%, ${activeSwatch.hex} 0%, transparent 65%)`,
                }}
              />
            ) : null}

            <img
              src={product.gallery[active] ?? product.image}
              alt={product.name}
              width={800}
              height={1000}
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <button
              type="button"
              aria-label="Zoom image"
              onClick={(e) => {
                e.stopPropagation();
                setZoomOpen(true);
              }}
              className="absolute bottom-4 right-4 grid size-10 place-items-center bg-card/85 text-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
            >
              <Maximize2 className="size-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {product.gallery.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={active === i}
                  className={cn(
                    "w-20 shrink-0 cursor-pointer overflow-hidden border transition-all",
                    active === i
                      ? "border-gold ring-1 ring-gold/40"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={img} alt="" loading="lazy" className="aspect-[4/5] object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right column: Info & Actions */}
        <div className="lg:pt-4">
          <div className="flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="text-[0.62rem] tracking-[0.2em] uppercase">
              <Link to="/shop" className="text-muted-foreground hover:text-gold-deep">
                Shop
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-muted-foreground uppercase">{product.category}</span>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label="Share product"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="size-3.5" />
              <span className="text-[0.65rem] tracking-wider uppercase">Share</span>
            </button>
          </div>

          <h1 className="mt-4 font-serif text-4xl leading-tight lg:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <p className="text-xl font-medium text-gold-deep">{formatKES(product.price)}</p>
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" /> In Stock &amp; Ready to
                Ship
              </span>
            ) : (
              <span className="bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                Sold Out
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Color Selector */}
          <div className="mt-8 border-t border-border/60 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.65rem] tracking-[0.22em] text-foreground uppercase">
                Colour — <span className="font-semibold text-gold-deep">{color}</span>
              </h2>
            </div>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={color === c.name}
                  className={cn(
                    "size-8 cursor-pointer rounded-full border-2 transition-all duration-300",
                    color === c.name ? "border-gold scale-110" : "border-border hover:scale-105",
                  )}
                  style={{
                    backgroundColor: c.hex,
                    boxShadow:
                      color === c.name
                        ? `0 0 0 3px color-mix(in oklab, ${c.hex} 35%, transparent), 0 8px 24px -6px ${c.hex}`
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Size Selector & Guide */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.65rem] tracking-[0.22em] text-foreground uppercase">
                Size {size ? `— ${size}` : ""}
              </h2>
              <button
                type="button"
                onClick={() => setShowSizeGuide((s) => !s)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-gold-deep"
              >
                <Ruler className="size-3.5" strokeWidth={1.4} />{" "}
                {showSizeGuide ? "Hide size guide" : "Size guide"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={cn(
                    "min-w-14 cursor-pointer border px-4 py-3 text-[0.7rem] tracking-[0.14em] uppercase transition-all font-medium",
                    size === s
                      ? "border-gold bg-gold/15 text-foreground ring-1 ring-gold/40"
                      : "border-border text-muted-foreground hover:border-gold/60 hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Collapsible Size Guide Table */}
            {showSizeGuide ? (
              <div className="mt-4 border border-border bg-card p-4 animate-in fade-in">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Measurement Guide (Centimetres)
                </p>
                <table className="mt-3 w-full border border-border text-left text-xs">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="p-2 font-normal">Size</th>
                      <th className="p-2 font-normal">Chest (cm)</th>
                      <th className="p-2 font-normal">Length (cm)</th>
                      <th className="p-2 font-normal">Sleeve (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ["S", "104", "68", "62"],
                      ["M", "110", "70", "64"],
                      ["L", "116", "72", "66"],
                      ["XL", "122", "74", "68"],
                      ["XXL", "128", "76", "70"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-t border-border">
                        {row.map((cell) => (
                          <td key={cell} className="p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] text-muted-foreground">
                  * Tailored relaxed fit. If you prefer a tighter cut, choose one size down.
                </p>
              </div>
            ) : null}
          </div>

          {/* Quantity & Wishlist Button */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-border bg-card">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid size-12 cursor-pointer place-items-center hover:bg-secondary transition-colors"
              >
                <Minus className="size-3.5" strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="grid size-12 cursor-pointer place-items-center hover:bg-secondary transition-colors"
              >
                <Plus className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-pressed={wishlisted}
              aria-label="Save to wishlist"
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-12 items-center gap-2 border border-border px-5 text-xs uppercase tracking-wider transition-colors hover:border-gold hover:text-gold-deep"
            >
              <Heart
                className={cn("size-4", wishlisted && "fill-gold text-gold")}
                strokeWidth={1.4}
              />
              <span>{wishlisted ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button variant="gold" size="luxlg" onClick={add} disabled={!product.inStock}>
              {product.inStock ? "Add to Bag" : "Sold Out"}
            </Button>
            <Button
              variant="ink"
              size="luxlg"
              asChild={product.inStock}
              disabled={!product.inStock}
            >
              {product.inStock ? (
                <Link to="/checkout" onClick={add}>
                  Instant Buy
                </Link>
              ) : (
                <span>Sold Out</span>
              )}
            </Button>
          </div>

          {/* Delivery & Assurance Badges */}
          <div className="mt-8 grid grid-cols-2 gap-3 rounded-xs border border-border/70 bg-card p-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 text-gold shrink-0" />
              <div>
                <p className="font-medium text-foreground">Fast Dispatch</p>
                <p className="text-[0.65rem] text-muted-foreground">Within 24h across Kenya</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="size-4 text-gold shrink-0" />
              <div>
                <p className="font-medium text-foreground">14-Day Exchanges</p>
                <p className="text-[0.65rem] text-muted-foreground">Hassle-free size swaps</p>
              </div>
            </div>
          </div>

          {/* Collapsible Accordion Tabs */}
          <div className="mt-8 divide-y divide-border/70 border-y border-border/70">
            {/* Craftsmanship */}
            <div>
              <button
                type="button"
                onClick={() =>
                  setOpenAccordion(openAccordion === "craftsmanship" ? null : "craftsmanship")
                }
                className="flex w-full items-center justify-between py-4 text-left font-serif text-lg text-foreground hover:text-gold-deep transition-colors"
              >
                <span>Materials &amp; Craftsmanship</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-300",
                    openAccordion === "craftsmanship" && "rotate-180",
                  )}
                />
              </button>
              {openAccordion === "craftsmanship" ? (
                <div className="pb-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in">
                  <p>
                    Precision crafted using dense 420 GSM loopback cotton fleece, reinforced
                    double-needle seams, and premium tonal gold embroidery. Designed in Nairobi for
                    longevity and timeless elegance.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Sizing & Fit */}
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "fit" ? null : "fit")}
                className="flex w-full items-center justify-between py-4 text-left font-serif text-lg text-foreground hover:text-gold-deep transition-colors"
              >
                <span>Fit &amp; Sizing Notes</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-300",
                    openAccordion === "fit" && "rotate-180",
                  )}
                />
              </button>
              {openAccordion === "fit" ? (
                <div className="pb-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in">
                  <p>
                    Tailored modern silhouette with dropped shoulders for effortless draping.
                    Designed to fit true to size. If you desire a boxier streetwear look, we advise
                    taking one size up.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Shipping & Delivery */}
            <div>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                className="flex w-full items-center justify-between py-4 text-left font-serif text-lg text-foreground hover:text-gold-deep transition-colors"
              >
                <span>Nationwide Delivery &amp; M-Pesa</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-300",
                    openAccordion === "shipping" && "rotate-180",
                  )}
                />
              </button>
              {openAccordion === "shipping" ? (
                <div className="pb-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in">
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Same-day delivery in Nairobi via dedicated dispatch riders.</li>
                    <li>1–2 business days delivery across all 47 Kenyan counties.</li>
                    <li>Complimentary delivery on all orders above KES 5,000.</li>
                    <li>Secure STK Push M-Pesa payments and Cash on Delivery supported.</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Patron Reviews Section */}
      <section className="border-t border-border/70 bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-8">
            <div>
              <p className="eyebrow">Verified Patron Feedback</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-foreground">
                Client Reviews &amp; Fit Ratings
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-gold" />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong className="text-foreground font-semibold">4.9 / 5.0</strong> · 28 Verified
                  Orders
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Dennis Mutua",
                location: "Westlands, Nairobi",
                quote:
                  "Fabric is legitimately 420 GSM heavyweight. It doesn't lose structure after cold wash, and the tonal embroidery on the chest is subtle and ultra-clean.",
                fit: "True to Size (Relaxed Drop Shoulder)",
                verified: true,
              },
              {
                name: "Sharon Achieng",
                location: "Lavington, Nairobi",
                quote:
                  "Same-day rider delivery was on point. The drape on the shoulders is exactly what you want from high-end streetwear. Will definitely order the overshirt next.",
                fit: "Oversized Look",
                verified: true,
              },
              {
                name: "Patrick Mwangi",
                location: "Eldoret, Kenya",
                quote:
                  "Delivered to Eldoret in under 24 hours. The packaging was immaculate with tissue wrap and dispatch notes. Top tier Kenyan brand.",
                fit: "True to Size",
                verified: true,
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xs border border-border/70 bg-card p-6 shadow-xs hover:border-gold/60 transition-colors"
              >
                <div>
                  <div className="flex gap-1 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-gold" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-foreground italic">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 border-t border-border/60 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{rev.name}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{rev.location}</p>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-700 dark:text-emerald-400">
                      Verified Buyer
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.62rem] text-gold-deep">Fit: {rev.fit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pieces */}
      {related.length ? (
        <section className="bg-[image:var(--gradient-ivory)] py-16 lg:py-24 border-t border-border/70">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <SectionHeading eyebrow="Curated Ensemble" title="You May Also Like" />
            <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Recently Viewed Strip */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Interactive Size & Fit Advisor Modal */}
      <SizeGuideDialog
        open={showSizeGuide}
        onOpenChange={setShowSizeGuide}
        category={product.category}
      />

      {/* Lightroom Image Zoom Modal */}
      {zoomOpen ? (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoomed image"
            className="absolute top-6 right-6 grid size-12 place-items-center bg-card text-foreground rounded-full shadow-lg cursor-pointer"
          >
            <X className="size-6" />
          </button>
          <img
            src={product.gallery[active] ?? product.image}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}

      {/* Share Modal Dialog */}
      {shareOpen ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-sm border border-border bg-card p-6 shadow-2xl rounded-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <h3 className="font-serif text-2xl">Share Piece</h3>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="flex w-full items-center gap-3 border border-border p-3 text-sm hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <MessageCircle className="size-4 text-emerald-600" /> Share via WhatsApp
              </button>
              <button
                type="button"
                onClick={copyProductLink}
                className="flex w-full items-center gap-3 border border-border p-3 text-sm hover:border-gold hover:text-gold-deep transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4 text-gold" />
                )}
                {copied ? "Link Copied!" : "Copy Direct Link"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
