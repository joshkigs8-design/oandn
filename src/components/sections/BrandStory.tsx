import { motion } from 'framer-motion'

export default function BrandStory() {
  return (
    <section className="relative py-24 md:py-32 bg-ivory-50 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-ivory-200 bg-white/95 p-10 shadow-[0_28px_80px_-40px_rgba(31,26,23,0.18)]"
          >
            <div className="space-y-6">
              <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">A refined story</p>
              <h2 className="font-serif text-4xl leading-tight text-charcoal">
                More than clothing — a quietly luxurious wardrobe.
              </h2>
              <p className="text-base leading-8 text-charcoal/75">
                O&amp;N is founded on effortless style, premium fabrics, and modern silhouettes that feel both elevated and easy to wear. Every piece is made to become a daily favorite.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {[
              {
                title: 'Seasonless essentials',
                description: 'Warm neutrals and elegant details that stay in style year-round.',
              },
              {
                title: 'Quiet confidence',
                description: 'Pieces designed to feel polished without trying too hard.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-[1.75rem] border border-ivory-200 bg-ivory-100/90 p-8">
                <p className="font-serif text-xl text-charcoal mb-3">{item.title}</p>
                <p className="text-sm leading-7 text-charcoal/70">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
