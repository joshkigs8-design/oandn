import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-5 flex items-center gap-2",
          align === "center" ? "justify-center" : "justify-start",
        )}
      >
        <span className="h-px w-10 bg-gold/60" />
        <span className="h-1 w-1 rotate-45 bg-gold" />
        <span className="h-px w-10 bg-gold/60" />
      </div>
    </div>
  );
}
