import { cn } from "@/lib/utils";

/**
 * Decorative champagne-gold flowing lines + particles, inspired by the
 * brand reference imagery. Purely presentational.
 */
export function GoldFlow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <linearGradient id="on-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.05 88)" />
          <stop offset="45%" stopColor="oklch(0.72 0.085 78)" />
          <stop offset="100%" stopColor="oklch(0.62 0.08 72)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#on-gold)" className="animate-drift">
        <path
          d="M-40 120 C 180 40, 320 220, 560 130 S 840 60, 900 150"
          strokeWidth="1.2"
          opacity="0.55"
        />
        <path
          d="M-40 160 C 200 80, 340 260, 580 170 S 860 100, 920 190"
          strokeWidth="3"
          opacity="0.3"
        />
        <path
          d="M-60 480 C 160 560, 380 420, 620 520 S 860 600, 940 540"
          strokeWidth="1"
          opacity="0.45"
        />
        <path d="M-60 520 C 180 600, 400 460, 640 560" strokeWidth="4" opacity="0.18" />
        <circle cx="640" cy="90" r="120" strokeWidth="0.8" opacity="0.25" />
        <circle cx="700" cy="420" r="180" strokeWidth="0.6" opacity="0.18" />
      </g>
      <g fill="url(#on-gold)">
        <circle cx="120" cy="90" r="3" opacity="0.5" />
        <circle cx="210" cy="160" r="2" opacity="0.4" />
        <circle cx="520" cy="60" r="4" opacity="0.45" />
        <circle cx="700" cy="240" r="2.5" opacity="0.5" />
        <circle cx="380" cy="520" r="3.5" opacity="0.4" />
        <circle cx="90" cy="430" r="2" opacity="0.45" />
        <circle cx="760" cy="520" r="3" opacity="0.35" />
      </g>
    </svg>
  );
}
