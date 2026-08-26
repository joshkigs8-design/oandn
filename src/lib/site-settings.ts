import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ANNOUNCEMENT_FALLBACK = "FREE DELIVERY ON ORDERS ABOVE KES 5,000";

export type Announcement = { value: string; enabled: boolean };

export async function fetchAnnouncement(): Promise<Announcement> {
  const { data } = await supabase
    .from("site_settings")
    .select("value, enabled")
    .eq("key", "announcement")
    .maybeSingle();
  return {
    value: data?.value ?? ANNOUNCEMENT_FALLBACK,
    enabled: data?.enabled ?? true,
  };
}

export function useAnnouncement() {
  const { data } = useQuery({
    queryKey: ["announcement"],
    queryFn: fetchAnnouncement,
    staleTime: 60_000,
  });
  return data ?? { value: ANNOUNCEMENT_FALLBACK, enabled: true };
}
