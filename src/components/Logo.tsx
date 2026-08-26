import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "h-9 sm:h-11",
  md: "h-12 sm:h-15 lg:h-16",
  lg: "h-16 sm:h-20 lg:h-24",
  xl: "h-20 sm:h-28 lg:h-32",
};

export function Logo({ className, imageClassName, size = "md" }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="O&N FITS home"
      className={cn(
        "group inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.03]",
        className,
      )}
    >
      <img
        src={logoImg}
        alt="O&N FITS"
        width={1444}
        height={496}
        className={cn(
          "w-auto object-contain transition-all duration-300 group-hover:brightness-110 drop-shadow-xs",
          sizeClasses[size],
          imageClassName,
        )}
      />
    </Link>
  );
}

export function Watermark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none font-serif leading-none whitespace-nowrap",
        className,
      )}
    >
      O&amp;N
    </span>
  );
}
