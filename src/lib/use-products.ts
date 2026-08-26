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

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(rowToProduct);
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
