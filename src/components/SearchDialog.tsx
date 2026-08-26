import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Sparkles, ArrowRight, Package } from "lucide-react";
import { useProducts } from "@/lib/use-products";
import { useCategories } from "@/lib/use-categories";
import { formatKES } from "@/lib/catalog";

export function SearchDialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
}: {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}) {
  const isVisible = Boolean(open ?? isOpen);

  const handleToggle = useCallback(
    (next: boolean) => {
      if (onOpenChange) onOpenChange(next);
      if (!next && onClose) onClose();
    },
    [onOpenChange, onClose],
  );

  const [query, setQuery] = useState("");
  const products = useProducts();
  const categories = useCategories();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleToggle(!isVisible);
      }
      if (e.key === "Escape" && isVisible) {
        handleToggle(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isVisible, handleToggle]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.colors.some((c) => c.name.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [query, products]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-start justify-center overflow-y-auto bg-ink/70 p-4 pt-16 sm:pt-24 backdrop-blur-md animate-in fade-in"
      onClick={() => handleToggle(false)}
    >
      <div
        className="w-full max-w-2xl border border-border/80 bg-card p-6 shadow-2xl rounded-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <Search className="size-5 text-gold shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hoodies, tees, caps, outerwear, colours..."
            className="w-full bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground outline-none font-sans"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-block rounded border border-border px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground">
              ESC
            </span>
          )}
        </div>

        {/* Results / Suggestions */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="space-y-6 py-2">
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  Popular Collections
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/shop"
                      search={{ category: c.slug }}
                      onClick={() => handleToggle(false)}
                      className="border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground hover:border-gold hover:text-gold-deep transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  Featured Styles
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => handleToggle(false)}
                      className="flex items-center gap-3 border border-border/60 p-2 hover:border-gold transition-colors group"
                    >
                      <img src={p.image} alt={p.name} className="size-12 object-cover rounded-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground group-hover:text-gold-deep">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatKES(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto size-8 text-gold opacity-60" />
              <p className="mt-3 text-sm">No pieces found matching &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs">
                Try searching for &quot;hoodie&quot;, &quot;black&quot;, &quot;cotton&quot;, or
                &quot;oversized&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                Found {results.length} {results.length === 1 ? "piece" : "pieces"}
              </p>
              {results.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => handleToggle(false)}
                  className="flex items-center justify-between gap-4 border border-transparent p-2.5 hover:border-border hover:bg-secondary/40 transition-colors rounded-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-14 object-cover rounded-xs border border-border"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-gold-deep">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {p.category} · {p.sizes.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gold-deep">{formatKES(p.price)}</p>
                    <span className="text-[0.65rem] text-muted-foreground flex items-center justify-end gap-1 group-hover:text-foreground">
                      View <ArrowRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-border/80 pt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3 text-gold" /> Nationwide delivery across Kenya
          </span>
          <Link
            to="/shop"
            onClick={() => handleToggle(false)}
            className="text-gold-deep hover:underline"
          >
            View All Collection &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
