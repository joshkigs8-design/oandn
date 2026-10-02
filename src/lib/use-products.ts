import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as fallback, type Product } from "@/lib/catalog";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: unknown;
  in_stock: boolean;
  is_new: boolean;
  featured: boolean;
  sort_order: number;
};

export const rowToProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  price: row.price,
  category: row.category,
  image: row.image,
  gallery: row.gallery?.length ? row.gallery : [row.image],
  sizes: row.sizes ?? [],
  colors: Array.isArray(row.colors) ? (row.colors as Product["colors"]) : [],
  isNew: row.is_new,
  featured: row.featured,
  inStock: row.in_stock,
});

const LEGACY_DUMMY_SLUGS = new Set([
  "on-classic-hoodie",
  "on-overshirt",
  "on-minimal-tee",
  "on-signature-cap",
  "on-signature-beanie",
  "on-essential-hoodie",
  "on-relaxed-trousers",
  "on-boxy-tee-white",
]);

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data) return fallback;

    // Filter out old AI dummy seed records that have legacy slugs or placeholder asset paths
    const realDbRows = (data as unknown as ProductRow[]).filter(
      (r) => !LEGACY_DUMMY_SLUGS.has(r.slug) && !r.image.startsWith("/assets/"),
    );

    // If the database has only the legacy dummy records, use the master real catalog
    if (realDbRows.length === 0) {
      return fallback;
    }

    // Merge: master real catalog + any newly added custom products from Supabase
    const mappedDb = realDbRows.map(rowToProduct);
    const dbSlugs = new Set(mappedDb.map((p) => p.slug));
    return [...fallback.filter((p) => !dbSlugs.has(p.slug)), ...mappedDb];
  } catch {
    return fallback;
  }
}

export function useProducts() {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    placeholderData: fallback,
    staleTime: 30_000,
  });
  return query.data ?? fallback;
}
