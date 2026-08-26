import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categories as fallback, type Category } from "@/lib/catalog";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, image, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    name: c.name as string,
    image: (c.image as string) || "/assets/cat-hoodies.jpg",
  }));
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    placeholderData: fallback,
    staleTime: 30_000,
  });
  return query.data?.length ? query.data : fallback;
}
