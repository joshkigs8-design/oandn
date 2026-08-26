import { useState } from "react";
import { X, Ruler, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SizeGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: string;
};

const SIZING_DATA: Record<
  string,
  {
    cm: { size: string; chest: string; length: string; shoulder: string; sleeve: string }[];
    in: { size: string; chest: string; length: string; shoulder: string; sleeve: string }[];
  }
> = {
  hoodies: {
    cm: [
      { size: "S", chest: "112 cm", length: "68 cm", shoulder: "54 cm", sleeve: "62 cm" },
      { size: "M", chest: "118 cm", length: "71 cm", shoulder: "56 cm", sleeve: "64 cm" },
      { size: "L", chest: "124 cm", length: "74 cm", shoulder: "58 cm", sleeve: "66 cm" },
      { size: "XL", chest: "130 cm", length: "77 cm", shoulder: "60 cm", sleeve: "68 cm" },
      { size: "XXL", chest: "136 cm", length: "80 cm", shoulder: "62 cm", sleeve: "70 cm" },
    ],
    in: [
      { size: "S", chest: "44 in", length: "26.8 in", shoulder: "21.2 in", sleeve: "24.4 in" },
      { size: "M", chest: "46.5 in", length: "28.0 in", shoulder: "22.0 in", sleeve: "25.2 in" },
      { size: "L", chest: "48.8 in", length: "29.1 in", shoulder: "22.8 in", sleeve: "26.0 in" },
      { size: "XL", chest: "51.2 in", length: "30.3 in", shoulder: "23.6 in", sleeve: "26.8 in" },
      { size: "XXL", chest: "53.5 in", length: "31.5 in", shoulder: "24.4 in", sleeve: "27.6 in" },
    ],
  },
  "t-shirts": {
    cm: [
      { size: "S", chest: "106 cm", length: "70 cm", shoulder: "50 cm", sleeve: "22 cm" },
      { size: "M", chest: "112 cm", length: "73 cm", shoulder: "52 cm", sleeve: "23 cm" },
      { size: "L", chest: "118 cm", length: "76 cm", shoulder: "54 cm", sleeve: "24 cm" },
      { size: "XL", chest: "124 cm", length: "79 cm", shoulder: "56 cm", sleeve: "25 cm" },
      { size: "XXL", chest: "130 cm", length: "82 cm", shoulder: "58 cm", sleeve: "26 cm" },
    ],
    in: [
      { size: "S", chest: "41.7 in", length: "27.5 in", shoulder: "19.7 in", sleeve: "8.7 in" },
      { size: "M", chest: "44.1 in", length: "28.7 in", shoulder: "20.5 in", sleeve: "9.1 in" },
      { size: "L", chest: "46.5 in", length: "29.9 in", shoulder: "21.3 in", sleeve: "9.4 in" },
      { size: "XL", chest: "48.8 in", length: "31.1 in", shoulder: "22.0 in", sleeve: "9.8 in" },
      { size: "XXL", chest: "51.2 in", length: "32.3 in", shoulder: "22.8 in", sleeve: "10.2 in" },
    ],
  },
  outerwear: {
    cm: [
      { size: "S", chest: "116 cm", length: "72 cm", shoulder: "52 cm", sleeve: "63 cm" },
      { size: "M", chest: "122 cm", length: "75 cm", shoulder: "54 cm", sleeve: "65 cm" },
      { size: "L", chest: "128 cm", length: "78 cm", shoulder: "56 cm", sleeve: "67 cm" },
      { size: "XL", chest: "134 cm", length: "81 cm", shoulder: "58 cm", sleeve: "69 cm" },
    ],
    in: [
      { size: "S", chest: "45.7 in", length: "28.3 in", shoulder: "20.5 in", sleeve: "24.8 in" },
      { size: "M", chest: "48.0 in", length: "29.5 in", shoulder: "21.3 in", sleeve: "25.6 in" },
      { size: "L", chest: "50.4 in", length: "30.7 in", shoulder: "22.0 in", sleeve: "26.4 in" },
      { size: "XL", chest: "52.8 in", length: "31.9 in", shoulder: "22.8 in", sleeve: "27.2 in" },
    ],
  },
};

export function SizeGuideDialog({
  open,
  onOpenChange,
  category = "hoodies",
}: SizeGuideDialogProps) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [selectedFit, setSelectedFit] = useState<"relaxed" | "true" | "oversized">("relaxed");

  if (!open) return null;

  const activeCategoryKey =
    category.toLowerCase().includes("tee") || category.toLowerCase().includes("t-shirt")
      ? "t-shirts"
      : category.toLowerCase().includes("coat") ||
          category.toLowerCase().includes("shirt") ||
          category.toLowerCase().includes("outerwear")
        ? "outerwear"
        : "hoodies";

  const tableData = SIZING_DATA[activeCategoryKey]?.[unit] ?? SIZING_DATA["hoodies"]![unit];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-md animate-in fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/80 bg-card p-6 sm:p-8 shadow-2xl rounded-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/70 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-widest">
              <Ruler className="size-3.5" /> Atelier Size &amp; Fit Advisor
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-foreground">
              Garment Measurements
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Unit & Fit Switchers */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {/* Fit Silhouette selector */}
          <div className="flex gap-2">
            {[
              { id: "relaxed", label: "Relaxed (Drop Shoulder)" },
              { id: "true", label: "True to Size" },
              { id: "oversized", label: "Oversized Boxy" },
            ].map((fit) => (
              <button
                key={fit.id}
                type="button"
                onClick={() => setSelectedFit(fit.id as typeof selectedFit)}
                className={cn(
                  "px-3 py-1.5 text-[0.65rem] uppercase tracking-wider rounded-xs transition-colors cursor-pointer",
                  selectedFit === fit.id
                    ? "bg-gold text-primary-foreground font-semibold"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {fit.label}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center rounded-xs border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setUnit("cm")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer",
                unit === "cm" ? "bg-gold text-primary-foreground" : "text-muted-foreground",
              )}
            >
              CM
            </button>
            <button
              type="button"
              onClick={() => setUnit("in")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer",
                unit === "in" ? "bg-gold text-primary-foreground" : "text-muted-foreground",
              )}
            >
              IN
            </button>
          </div>
        </div>

        {/* Sizing Table */}
        <div className="mt-6 overflow-x-auto border border-border/80 rounded-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground uppercase text-[0.65rem] tracking-wider border-b border-border">
              <tr>
                <th className="p-3 font-semibold">Size</th>
                <th className="p-3 font-semibold">Chest Circumference</th>
                <th className="p-3 font-semibold">Back Length</th>
                <th className="p-3 font-semibold">Shoulder Width</th>
                <th className="p-3 font-semibold">Sleeve Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tableData.map((row) => (
                <tr key={row.size} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3 font-bold text-foreground font-serif text-sm">{row.size}</td>
                  <td className="p-3 text-foreground">{row.chest}</td>
                  <td className="p-3 text-muted-foreground">{row.length}</td>
                  <td className="p-3 text-muted-foreground">{row.shoulder}</td>
                  <td className="p-3 text-muted-foreground">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit Advice Box */}
        <div className="mt-6 rounded-xs border border-gold/30 bg-gold/10 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="size-4 text-gold shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">O&amp;N Proportions Guidance:</p>
              <p className="text-muted-foreground leading-relaxed">
                All O&amp;N Fleece and Tops are pre-shrunk with a tailored drop shoulder. If you
                prefer a contemporary boxy streetwear silhouette, order your standard size. For a
                fitted look, choose one size down.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-gold" /> Free 14-Day Doorstep Size Exchanges Across
            Kenya
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold text-gold-deep hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
