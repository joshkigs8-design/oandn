import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OrderStage =
  "idle" | "processing" | "vehicleArriving" | "packagePickup" | "vehicleLeaving" | "success";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Drives a miniature delivery scene inside the submit button.
 * The visual stages run on their own timeline; `success` is only reached
 * once the caller reports the backend confirmed the order.
 */
export function useDeliverySequence() {
  const [stage, setStage] = useState<OrderStage>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = () => {
    clear();
    setStage("processing");
    timers.current.push(setTimeout(() => setStage("vehicleArriving"), 120));
    timers.current.push(setTimeout(() => setStage("packagePickup"), 1500));
    timers.current.push(setTimeout(() => setStage("vehicleLeaving"), 2350));
  };
  const finish = () => {
    clear();
    setStage("success");
  };
  const fail = () => {
    clear();
    setStage("idle");
  };
  return { stage, start, finish, fail, busy: stage !== "idle" && stage !== "success" };
}

export function DeliveryButton({
  stage,
  idleLabel = "Place Order",
  successLabel = "Order Placed",
  className,
}: {
  stage: OrderStage;
  idleLabel?: string;
  successLabel?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const animating =
    stage === "processing" ||
    stage === "vehicleArriving" ||
    stage === "packagePickup" ||
    stage === "vehicleLeaving";

  const vanX =
    stage === "processing"
      ? -70
      : stage === "vehicleArriving"
        ? 78
        : stage === "packagePickup"
          ? 84
          : stage === "vehicleLeaving"
            ? 300
            : -70;

  const packLifted = stage === "packagePickup" || stage === "vehicleLeaving";

  return (
    <Button
      type="submit"
      variant="gold"
      size="luxlg"
      disabled={animating}
      aria-live="polite"
      className={cn("relative w-full overflow-hidden", className)}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-2 transition-opacity duration-300",
          animating && "opacity-0",
        )}
      >
        {stage === "success" ? (
          <>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              <path
                d="M4 12.6l5 5L20 6.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 0,
                  animation: reduced ? undefined : "ond-draw 520ms ease-out",
                }}
              />
            </svg>
            {successLabel}
          </>
        ) : (
          idleLabel
        )}
      </span>

      {/* Miniature delivery scene */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          animating ? "opacity-100" : "opacity-0",
        )}
      >
        {reduced ? (
          <span className="flex h-full items-center justify-center text-[0.7rem] tracking-[0.2em] uppercase">
            Placing order…
          </span>
        ) : (
          <svg viewBox="0 0 240 48" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            {/* road */}
            <rect x="0" y="34" width="240" height="14" fill="oklch(0.32 0.012 60 / 0.16)" />
            <g
              style={{
                animation: animating ? "ond-road 700ms linear infinite" : undefined,
              }}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * 24}
                  y="40"
                  width="12"
                  height="2"
                  rx="1"
                  fill="currentColor"
                  opacity="0.5"
                />
              ))}
            </g>

            {/* package */}
            <g
              style={{
                transform: packLifted ? "translate(14px,-16px) scale(0.6)" : "translate(0,0)",
                opacity: packLifted ? 0 : 1,
                transition: "transform 650ms cubic-bezier(.34,1.3,.5,1), opacity 650ms ease",
              }}
            >
              <rect x="104" y="22" width="13" height="12" rx="1.5" fill="oklch(0.72 0.05 70)" />
              <path d="M110.5 22v12M104 27.5h13" stroke="oklch(0.4 0.03 60)" strokeWidth="1" />
            </g>

            {/* van */}
            <g
              style={{
                transform: `translateX(${vanX}px)`,
                transition:
                  stage === "vehicleLeaving"
                    ? "transform 900ms cubic-bezier(.5,0,.75,0)"
                    : "transform 1300ms cubic-bezier(.25,.8,.35,1)",
              }}
            >
              <g style={{ animation: "ond-bob 420ms ease-in-out infinite" }}>
                <ellipse cx="18" cy="36" rx="22" ry="3" fill="oklch(0.3 0.01 60 / 0.18)" />
                <rect x="-4" y="16" width="28" height="16" rx="3" fill="currentColor" />
                <path d="M24 22h9l6 6v4H24z" fill="currentColor" opacity="0.85" />
                <rect
                  x="25.5"
                  y="23.5"
                  width="7"
                  height="5"
                  rx="1"
                  fill="oklch(0.97 0.01 90 / 0.7)"
                />
                <text
                  x="10"
                  y="27"
                  textAnchor="middle"
                  fontSize="7"
                  fill="oklch(0.98 0.005 90)"
                  letterSpacing="0.5"
                >
                  O&amp;N
                </text>
                <g
                  style={{
                    animation: "ond-spin 420ms linear infinite",
                    transformOrigin: "3px 33px",
                  }}
                >
                  <circle cx="3" cy="33" r="3.6" fill="oklch(0.28 0.012 60)" />
                  <path d="M3 30v6M0 33h6" stroke="oklch(0.85 0.03 80)" strokeWidth="0.8" />
                </g>
                <g
                  style={{
                    animation: "ond-spin 420ms linear infinite",
                    transformOrigin: "31px 33px",
                  }}
                >
                  <circle cx="31" cy="33" r="3.6" fill="oklch(0.28 0.012 60)" />
                  <path d="M31 30v6M28 33h6" stroke="oklch(0.85 0.03 80)" strokeWidth="0.8" />
                </g>
              </g>
            </g>
          </svg>
        )}
      </span>

      <style>{`
        @keyframes ond-road { to { transform: translateX(-24px); } }
        @keyframes ond-spin { to { transform: rotate(360deg); } }
        @keyframes ond-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-0.7px)} }
        @keyframes ond-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
      `}</style>
    </Button>
  );
}

export default DeliveryButton;
