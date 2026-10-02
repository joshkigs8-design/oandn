import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categories as fallback, type Category } from "@/lib/catalog";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, image, sort_order")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length < fallback.length) return fallback;
    return (data ?? []).map((c) => ({
      id: c.id as string,
      slug: c.slug as string,
      name: c.name as string,
      image: (c.image as string) || "/images/catalog/on-real-45.jpeg",
    }));
  } catch {
    return fallback;
  }
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    placeholderData: fallback,
    staleTime: 30_000,
  });
  return query.data && query.data.length >= fallback.length ? query.data : fallback;
}
