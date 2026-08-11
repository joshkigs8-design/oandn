import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function PromoBanner() {
  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-[2rem] border border-ivory-200 bg-white/95 p-10 shadow-[0_28px_90px_-40px_rgba(31,26,23,0.18)]"
        >
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">
                LIMITED OFFER
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl">
                Enjoy 15% off orders over KES 4,000.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-charcoal/70 sm:text-base">
                Refresh your wardrobe with elevated essentials, modern tailoring, and soft finishes that feel effortless every day.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Link to="/shop" className="btn-primary">
                Shop the sale
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
