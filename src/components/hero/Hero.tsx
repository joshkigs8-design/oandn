import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GoldDecorations from './GoldDecorations'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory-50">
      <GoldDecorations className="absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(196,164,116,0.18),_transparent_38%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(circle_at_bottom_right,_rgba(180,145,92,0.14),_transparent_45%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <span className="hero-watermark">O&N</span>
        </div>

        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="section-label">New season essentials</p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
              Timeless Style.
              <span className="block text-gold-600">Made for You.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-charcoal/75 sm:text-lg">
              Premium quality. Modern designs. Made to stand out with soft textures, refined details, and a warm cream palette.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/shop" className="btn-primary">
                  SHOP NOW
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to="/shop" className="btn-secondary">
                  EXPLORE COLLECTIONS <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-ivory-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-gold-600">Soft Touch</p>
                <p className="mt-3 text-sm text-charcoal/70">Modern essentials with elevated fabrics and a refined sensorial finish.</p>
              </div>
              <div className="rounded-[1.5rem] border border-ivory-200 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-gold-600">Effortless Form</p>
                <p className="mt-3 text-sm text-charcoal/70">Minimal silhouettes designed for daily confidence and understated luxury.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-gold-200/30 bg-ivory-100 shadow-[0_40px_120px_-40px_rgba(31,26,23,0.22)]">
              <div className="aspect-[4/5] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_rgba(231,212,181,0.24)_55%,_transparent_95%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(196,164,116,0.16),_transparent_35%)]" />
                <div className="absolute inset-x-8 top-8 h-[calc(100%-4rem)] rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(223,201,167,0.22))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.56)]">
                  <div className="flex h-full items-end justify-center p-8">
                    <div className="w-full rounded-[1.5rem] bg-[radial-gradient(circle,_rgba(255,255,255,0.92),_rgba(224,203,170,0.3)_55%)] px-6 py-12 text-center">
                      <p className="font-serif text-4xl text-charcoal/20 tracking-tight">O&N</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ivory-50 to-transparent" />
              </div>
              <div className="border-t border-ivory-200 bg-ivory-100 px-6 py-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold-600">Featured Drop</p>
                    <p className="mt-2 font-serif text-xl text-charcoal">O&N Signature Hoodie</p>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">KES 3,500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
