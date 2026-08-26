import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MascotState = "idle" | "email" | "password" | "passwordVisible" | "error" | "success";

function usePrefersReducedMotion() {
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

/** Interactive O&N Fits mascot: reacts to input focus and auth state. */
export function AuthMascot({ state, className }: { state: MascotState; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [blink, setBlink] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    const loop = () => {
      timer.current = setTimeout(
        () => {
          if (!alive) return;
          setBlink(true);
          setTimeout(() => alive && setBlink(false), 130);
          loop();
        },
        2200 + Math.random() * 2600,
      );
    };
    loop();
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reduced]);

  const hiding = state === "password";
  const peeking = state === "passwordVisible";
  const happy = state === "success";
  const sad = state === "error";

  // Where the pupils look: x/y offsets in SVG units.
  const look = hiding
    ? { x: -5, y: -3 }
    : peeking
      ? { x: 2.4, y: 4 }
      : state === "email"
        ? { x: 0.5, y: 3.4 }
        : { x: 0, y: 0 };
  const headRotate = hiding ? -13 : peeking ? -5 : state === "email" ? 4 : 0;
  const eyesShut = blink || hiding;

  const ease = reduced ? "none" : "cubic-bezier(0.34, 1.4, 0.5, 1)";

  return (
    <div
      className={cn("mx-auto w-40 select-none sm:w-48", className)}
      aria-hidden="true"
      data-state={state}
    >
      <svg viewBox="0 0 200 200" className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="onm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.055 84)" />
            <stop offset="55%" stopColor="oklch(0.74 0.082 79)" />
            <stop offset="100%" stopColor="oklch(0.62 0.075 68)" />
          </linearGradient>
          <radialGradient id="onm-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.82 0.06 82 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.82 0.06 82 / 0)" />
          </radialGradient>
          <filter id="onm-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="oklch(0.32 0.02 60)"
              floodOpacity="0.16"
            />
          </filter>
        </defs>

        <ellipse cx="100" cy="104" rx="86" ry="82" fill="url(#onm-glow)" />

        {/* Body / shoulders */}
        <g filter="url(#onm-shadow)">
          <path d="M44 196c2-32 24-49 56-49s54 17 56 49z" fill="oklch(0.29 0.012 60)" />
          <path d="M86 150h28l-14 20z" fill="oklch(0.96 0.008 82)" opacity="0.9" />
          <text
            x="100"
            y="188"
            textAnchor="middle"
            fontSize="13"
            letterSpacing="3"
            fill="url(#onm-gold)"
            fontFamily="var(--font-serif, serif)"
          >
            O&amp;N
          </text>
        </g>

        {/* Head group */}
        <g
          style={{
            transform: `rotate(${headRotate}deg) translateY(${happy ? -4 : 0}px)`,
            transformOrigin: "100px 140px",
            transition: reduced ? "none" : `transform 620ms ${ease}`,
          }}
        >
          <g
            style={{
              transformOrigin: "100px 140px",
              animation: reduced
                ? undefined
                : happy
                  ? "onm-bounce 720ms ease-out 1"
                  : sad
                    ? "onm-shake 520ms ease-in-out 1"
                    : "onm-breathe 4.6s ease-in-out infinite",
            }}
          >
            {/* Ears */}
            <ellipse cx="52" cy="96" rx="8" ry="12" fill="oklch(0.87 0.03 66)" />
            <ellipse cx="148" cy="96" rx="8" ry="12" fill="oklch(0.87 0.03 66)" />

            {/* Face */}
            <g filter="url(#onm-shadow)">
              <rect x="52" y="52" width="96" height="102" rx="42" fill="oklch(0.9 0.028 68)" />
            </g>

            {/* Beanie / cap */}
            <path d="M52 92c0-30 21-48 48-48s48 18 48 48z" fill="oklch(0.29 0.012 60)" />
            <rect x="50" y="86" width="100" height="12" rx="6" fill="url(#onm-gold)" />

            {/* Eyebrows */}
            <g
              style={{
                transition: reduced ? "none" : `transform 320ms ease`,
                transform: sad ? "translateY(4px)" : happy ? "translateY(-3px)" : "translateY(0)",
              }}
            >
              <path
                d={sad ? "M68 104l22 7" : "M68 105l22-4"}
                stroke="oklch(0.32 0.015 60)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={sad ? "M132 104l-22 7" : "M132 105l-22-4"}
                stroke="oklch(0.32 0.015 60)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Eyes */}
            {[78, 122].map((cx) => (
              <g key={cx}>
                {eyesShut ? (
                  <path
                    d={`M${cx - 9} 120q9 7 18 0`}
                    stroke="oklch(0.3 0.015 60)"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                ) : (
                  <>
                    <ellipse
                      cx={cx}
                      cy="120"
                      rx="9"
                      ry={happy ? 8 : 9.5}
                      fill="oklch(0.99 0.004 90)"
                      stroke="oklch(0.8 0.02 70)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={cx + look.x}
                      cy={120 + look.y}
                      r="4.6"
                      fill="oklch(0.28 0.015 60)"
                      style={{
                        transition: reduced ? "none" : `all 380ms ${ease}`,
                      }}
                    />
                    <circle cx={cx + look.x + 1.6} cy={118 + look.y} r="1.5" fill="#fff" />
                  </>
                )}
              </g>
            ))}

            {/* Mouth */}
            <path
              d={
                happy
                  ? "M86 138q14 15 28 0q-14 7-28 0"
                  : sad
                    ? "M88 143q12-9 24 0"
                    : hiding
                      ? "M90 140h20"
                      : "M89 139q11 6 22 0"
              }
              stroke="oklch(0.3 0.015 60)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill={happy ? "oklch(0.42 0.06 25)" : "none"}
              style={{ transition: reduced ? "none" : "d 300ms ease" }}
            />

            {/* Hands covering eyes */}
            <g
              style={{
                transform: hiding
                  ? "translateY(0) scale(1)"
                  : peeking
                    ? "translateY(30px) scale(0.98)"
                    : "translateY(78px) scale(0.9)",
                opacity: hiding ? 1 : peeking ? 0.85 : 0,
                transition: reduced ? "none" : `transform 560ms ${ease}, opacity 380ms ease`,
              }}
            >
              <rect
                x="52"
                y="104"
                width="46"
                height="32"
                rx="16"
                fill="oklch(0.83 0.038 64)"
                stroke="oklch(0.68 0.05 66)"
                strokeWidth="1.5"
              />
              <rect
                x="102"
                y="104"
                width="46"
                height="32"
                rx="16"
                fill="oklch(0.83 0.038 64)"
                stroke="oklch(0.68 0.05 66)"
                strokeWidth="1.5"
              />
              <path
                d="M60 118h30M110 118h30M60 126h30M110 126h30"
                stroke="oklch(0.7 0.05 68)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes onm-breathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes onm-bounce { 0%{transform:translateY(0)} 35%{transform:translateY(-14px)} 60%{transform:translateY(0)} 80%{transform:translateY(-5px)} 100%{transform:translateY(0)} }
        @keyframes onm-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 50%{transform:translateX(5px)} 75%{transform:translateX(-3px)} }
        @media (prefers-reduced-motion: reduce){ [data-state] svg g { animation: none !important; } }
      `}</style>
    </div>
  );
}

export default AuthMascot;
