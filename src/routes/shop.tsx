import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { LayoutGrid, ListFilter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { GoldFlow } from "@/components/GoldFlow";
import { useCategories } from "@/lib/use-categories";
import { useProducts } from "@/lib/use-products";
import { swatchPalette, formatKES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  maxPrice: z.number().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
  inStock: z.boolean().optional(),
});

const DESCRIPTION = "Shop the full O&N collection — hoodies, tees, caps, bottoms and outerwear.";

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Shop — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

const SIZES = ["S", "M", "L", "XL", "XXL", "One Size"];
const SORTS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular Pieces" },
] as const;

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const products = useProducts();
  const categories = useCategories();
  const [layoutMode, setLayoutMode] = useState<"standard" | "editorial">("standard");
  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const [priceCap, setPriceCap] = useState<number>(search.maxPrice ?? 5000);

  type ShopSearch = z.infer<typeof searchSchema>;
  const setSearch = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev: ShopSearch) => ({ ...prev, ...patch }) });

  const clearAllFilters = () => {
    setSearchInput("");
    setPriceCap(5000);
    navigate({ search: {} });
  };

  const hasActiveFilters = Boolean(
    search.category || search.size || search.color || search.inStock || search.q || search.maxPrice,
  );

  const list = useMemo(() => {
    let out = products.filter((p) => {
      if (search.q) {
        const query = search.q.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      if (search.category && p.category !== search.category) return false;
      if (search.size && !p.sizes.includes(search.size)) return false;
      if (search.color) {
        const hasColor = p.colors.some((c) => c.name.toLowerCase() === search.color?.toLowerCase());
        if (!hasColor) return false;
      }
      if (search.maxPrice && p.price > search.maxPrice) return false;
      if (search.inStock && !p.inStock) return false;
      return true;
    });

    switch (search.sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        out = [...out].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
        break;
      default:
        out = [...out].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    }
    return out;
  }, [search, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch({ q: searchInput.trim() || undefined });
  };

  return (
    <>
      <header className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-16 lg:py-24">
        <GoldFlow className="opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-serif text-5xl lg:text-7xl">Shop All Pieces</h1>
          <p className="mt-4 text-base text-muted-foreground">
            Explore elevated essentials handcrafted with precision in Nairobi.
          </p>

          {/* Quick search input bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search collection by name or style..."
                className="w-full border border-border bg-card/90 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-gold"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch({ q: undefined });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              className="border border-gold bg-gold/10 px-4 py-2.5 text-xs uppercase tracking-wider text-foreground hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              Filter
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 lg:grid-cols-[260px_1fr] lg:px-10">
        {/* Filters Sidebar */}
        <aside aria-label="Filters" className="space-y-8">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
              <SlidersHorizontal className="size-3.5 text-gold" /> Filter Collection
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[0.65rem] uppercase tracking-wider text-gold-deep hover:underline"
              >
                Reset All
              </button>
            ) : null}
          </div>

          {/* Category Filter */}
          <FilterGroup title="Categories">
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
              <Chip
                active={!search.category}
                onClick={() => setSearch({ category: undefined })}
                label="All Categories"
              />
              {categories.map((c) => (
                <Chip
                  key={c.slug}
                  active={search.category === c.slug}
                  onClick={() => setSearch({ category: c.slug })}
                  label={c.name}
                />
              ))}
            </div>
          </FilterGroup>

          {/* Size Filter */}
          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <Chip
                  key={s}
                  active={search.size === s}
                  onClick={() => setSearch({ size: search.size === s ? undefined : s })}
                  label={s}
                />
              ))}
            </div>
          </FilterGroup>

          {/* Color Palette Filter */}
          <FilterGroup title="Colours">
            <div className="flex flex-wrap gap-2">
              {swatchPalette.slice(0, 14).map((swatch) => {
                const active = search.color?.toLowerCase() === swatch.name.toLowerCase();
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    title={swatch.name}
                    aria-pressed={active}
                    onClick={() =>
                      setSearch({
                        color: active ? undefined : swatch.name,
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-all",
                      active
                        ? "border-gold bg-gold/15 text-foreground ring-1 ring-gold/40"
                        : "border-border text-muted-foreground hover:border-gold/60 hover:text-foreground",
                    )}
                  >
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span>{swatch.name}</span>
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          {/* Price Range Filter */}
          <FilterGroup title={`Max Price: ${formatKES(priceCap)}`}>
            <div className="space-y-2">
              <input
                type="range"
                min={500}
                max={5000}
                step={250}
                value={priceCap}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceCap(val);
                  setSearch({ maxPrice: val });
                }}
                className="w-full accent-[oklch(0.72_0.075_78)] cursor-pointer"
              />
              <div className="flex justify-between text-[0.65rem] text-muted-foreground">
                <span>KES 500</span>
                <span>KES 5,000+</span>
              </div>
            </div>
          </FilterGroup>

          {/* Stock Filter */}
          <FilterGroup title="Availability">
            <label className="flex cursor-pointer items-center gap-3 text-xs text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={!!search.inStock}
                onChange={(e) => setSearch({ inStock: e.target.checked || undefined })}
                className="size-4 accent-[oklch(0.72_0.075_78)] cursor-pointer"
              />
              In Stock Only
            </label>
          </FilterGroup>
        </aside>

        {/* Product Grid Section */}
        <section>
          {/* Top Bar Controls */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Showing <strong className="text-foreground">{list.length}</strong>{" "}
                {list.length === 1 ? "piece" : "pieces"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Layout Switcher */}
              <div className="hidden sm:flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setLayoutMode("standard")}
                  title="Compact Grid"
                  className={cn(
                    "p-2 text-muted-foreground transition-colors",
                    layoutMode === "standard"
                      ? "bg-secondary text-foreground"
                      : "hover:text-foreground",
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("editorial")}
                  title="Editorial Grid"
                  className={cn(
                    "p-2 text-muted-foreground transition-colors",
                    layoutMode === "editorial"
                      ? "bg-secondary text-foreground"
                      : "hover:text-foreground",
                  )}
                >
                  <ListFilter className="size-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <label className="flex items-center gap-2 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Sort
                <select
                  value={search.sort ?? "newest"}
                  onChange={(e) => setSearch({ sort: e.target.value as ShopSearch["sort"] })}
                  className="border border-border bg-card px-3 py-2 text-xs tracking-normal text-foreground normal-case outline-none focus:border-gold cursor-pointer"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Active Filters:
              </span>
              {search.q ? (
                <FilterTag
                  label={`Search: "${search.q}"`}
                  onRemove={() => {
                    setSearchInput("");
                    setSearch({ q: undefined });
                  }}
                />
              ) : null}
              {search.category ? (
                <FilterTag
                  label={`Category: ${search.category}`}
                  onRemove={() => setSearch({ category: undefined })}
                />
              ) : null}
              {search.size ? (
                <FilterTag
                  label={`Size: ${search.size}`}
                  onRemove={() => setSearch({ size: undefined })}
                />
              ) : null}
              {search.color ? (
                <FilterTag
                  label={`Color: ${search.color}`}
                  onRemove={() => setSearch({ color: undefined })}
                />
              ) : null}
              {search.maxPrice ? (
                <FilterTag
                  label={`Under ${formatKES(search.maxPrice)}`}
                  onRemove={() => {
                    setPriceCap(5000);
                    setSearch({ maxPrice: undefined });
                  }}
                />
              ) : null}
              {search.inStock ? (
                <FilterTag
                  label="In Stock Only"
                  onRemove={() => setSearch({ inStock: undefined })}
                />
              ) : null}
            </div>
          ) : null}

          {/* Products Grid */}
          {list.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border p-8">
              <Sparkles className="mx-auto size-8 text-gold opacity-60" />
              <p className="mt-4 font-serif text-xl">No matching pieces found</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Try adjusting your filters or search keywords to discover more of our collection.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 border border-gold bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-wider text-foreground hover:bg-gold hover:text-primary-foreground transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-x-5 gap-y-10",
                layoutMode === "editorial"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {list.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 60}>
                  <ProductCard product={p} layout={layoutMode} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.65rem] tracking-[0.24em] text-foreground uppercase font-medium">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer border px-3 py-2 text-[0.68rem] tracking-[0.14em] uppercase transition-all duration-300",
        active
          ? "border-gold bg-gold/15 text-foreground ring-1 ring-gold/40 font-medium"
          : "border-border text-muted-foreground hover:border-gold/60 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
