import { Link } from "@tanstack/react-router";
import { Sparkles, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { formatKES } from "@/lib/catalog";

export function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const { recentProducts, clearRecentlyViewed } = useRecentlyViewed();

  const filtered = recentProducts.filter((p) => p.id !== currentProductId);

  if (filtered.length === 0) return null;

  return (
    <section className="border-t border-border/70 bg-[image:var(--gradient-ivory)] py-16">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <h3 className="font-serif text-2xl text-foreground">Recently Viewed</h3>
          </div>
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1 text-[0.65rem] text-muted-foreground hover:text-destructive transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Trash2 className="size-3" /> Clear History
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="group block border border-border/70 bg-card p-2 rounded-xs shadow-xs hover:border-gold transition-colors"
            >
              <div className="aspect-[4/5] overflow-hidden bg-secondary rounded-xs">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-2.5">
                <p className="truncate text-xs font-medium text-foreground group-hover:text-gold-deep transition-colors">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gold-deep">
                  {formatKES(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
