import { motion } from 'framer-motion'

interface GoldDecorationsProps {
  className?: string
}

function GoldParticle({
  cx,
  cy,
  r,
  opacity,
  delay,
  duration,
  yOffset,
}: {
  cx: number
  cy: number
  r: number
  opacity: number
  delay: number
  duration: number
  yOffset: number
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill="url(#goldGradient)"
      opacity={opacity}
      animate={{ y: [0, yOffset, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

function GoldRing({
  cx,
  cy,
  r,
  strokeWidth,
  opacity,
  delay,
  rotateDuration,
}: {
  cx: number
  cy: number
  r: number
  strokeWidth: number
  opacity: number
  delay: number
  rotateDuration: number
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="url(#goldGradient)"
      strokeWidth={strokeWidth}
      opacity={opacity}
      animate={{ rotate: 360 }}
      transition={{
        duration: rotateDuration,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
      style={{ originX: cx, originY: cy }}
    />
  )
}

function GoldLine({
  d,
  strokeWidth,
  opacity,
  delay,
  duration,
}: {
  d: string
  strokeWidth: number
  opacity: number
  delay: number
  duration: number
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="url(#goldGradient)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      animate={{ opacity: [opacity, opacity * 1.6, opacity] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

export default function GoldDecorations({ className }: GoldDecorationsProps) {
  return (
    <div className={`pointer-events-none ${className ?? ''}`} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dcc399" />
            <stop offset="50%" stopColor="#c9a96e" />
            <stop offset="100%" stopColor="#b8944e" />
          </linearGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b8944e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <GoldParticle cx={1050} cy={120} r={60} opacity={0.25} delay={0} duration={8} yOffset={-20} />
        <GoldParticle cx={980} cy={220} r={35} opacity={0.35} delay={1.2} duration={6} yOffset={15} />
        <GoldParticle cx={1120} cy={300} r={18} opacity={0.3} delay={2.4} duration={7} yOffset={-12} />
        <GoldParticle cx={150} cy={650} r={45} opacity={0.2} delay={0.8} duration={9} yOffset={18} />
        <GoldParticle cx={250} cy={720} r={25} opacity={0.3} delay={2} duration={5.5} yOffset={-14} />
        <GoldParticle cx={600} cy={80} r={20} opacity={0.2} delay={3} duration={6.5} yOffset={10} />
        <GoldParticle cx={850} cy={680} r={30} opacity={0.25} delay={1.5} duration={8.5} yOffset={-16} />
        <GoldParticle cx={420} cy={750} r={15} opacity={0.35} delay={2.8} duration={4.5} yOffset={8} />
        <GoldParticle cx={700} cy={400} r={10} opacity={0.4} delay={0.5} duration={5} yOffset={-6} />
        <GoldParticle cx={200} cy={200} r={12} opacity={0.2} delay={3.5} duration={7} yOffset={12} />

        <GoldRing cx={1000} cy={180} r={90} strokeWidth={1.5} opacity={0.2} delay={0} rotateDuration={20} />
        <GoldRing cx={1080} cy={260} r={55} strokeWidth={1} opacity={0.25} delay={2} rotateDuration={25} />
        <GoldRing cx={180} cy={700} r={70} strokeWidth={1.5} opacity={0.15} delay={1} rotateDuration={22} />
        <GoldRing cx={300} cy={760} r={40} strokeWidth={1} opacity={0.2} delay={3} rotateDuration={18} />
        <GoldRing cx={580} cy={120} r={45} strokeWidth={1} opacity={0.2} delay={0.5} rotateDuration={24} />

        <GoldLine
          d="M 900 50 Q 950 150 900 250 T 900 400"
          strokeWidth={1.5}
          opacity={0.25}
          delay={0}
          duration={6}
        />
        <GoldLine
          d="M 100 600 Q 150 700 100 750"
          strokeWidth={1}
          opacity={0.2}
          delay={1.5}
          duration={7}
        />
        <GoldLine
          d="M 1100 400 Q 1150 500 1100 600"
          strokeWidth={1.2}
          opacity={0.2}
          delay={2.5}
          duration={5.5}
        />
        <GoldLine
          d="M 400 30 Q 500 80 600 40 T 800 90"
          strokeWidth={1}
          opacity={0.15}
          delay={3.5}
          duration={8}
        />

        <circle cx={600} cy={400} r={300} fill="url(#goldGlow)" opacity={0.08} />
        <circle cx={900} cy={200} r={200} fill="url(#goldGlow)" opacity={0.06} />
        <circle cx={200} cy={650} r={180} fill="url(#goldGlow)" opacity={0.05} />
      </svg>
    </div>
  )
}
