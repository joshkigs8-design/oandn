import { useAnnouncement } from "@/lib/site-settings";

export function AnnouncementBar() {
  const announcement = useAnnouncement();
  if (!announcement.enabled || !announcement.value.trim()) return null;
  return (
    <div className="bg-[image:var(--gradient-gold)] text-primary-foreground">
      <p className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-center text-[0.6rem] tracking-[0.24em] uppercase sm:text-[0.68rem]">
        <span aria-hidden="true">✦</span>
        {announcement.value}
      </p>
    </div>
  );
}
