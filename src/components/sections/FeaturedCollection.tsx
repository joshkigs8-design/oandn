import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function FeaturedCollection() {
  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] border border-ivory-200 bg-white/90 shadow-[0_30px_90px_-40px_rgba(31,26,23,0.18)]"
          >
            <div className="aspect-[4/5] bg-[radial-gradient(circle_at_top_left,_rgba(196,164,116,0.18),_transparent_45%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(223,201,167,0.22),_transparent_35%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory-50 to-transparent" />
              <div className="flex h-full items-end justify-start p-10">
                <div className="max-w-xs rounded-[1.5rem] border border-ivory-200 bg-ivory-100/95 p-8">
                  <p className="text-xs uppercase tracking-[0.26em] text-gold-600">Featured Collection</p>
                  <h3 className="mt-4 font-serif text-3xl text-charcoal">Quiet essentials for every season.</h3>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-600" />
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">The Signature Edit</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl lg:text-5xl">
                Elevated silhouettes made for the new everyday.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-charcoal/75">
              Discover a curated edit of elevated essentials crafted in luxurious textures, warm neutrals, and elegant tailoring. Each piece is designed to feel effortless and refined.
            </p>
            <Link to="/shop?filter=collection" className="btn-primary">
              Explore the Edit
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
