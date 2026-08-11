import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const categories = [
  { name: 'HOODIES', slug: '/shop?category=hoodies', gradient: 'from-beige-200 via-gold-100 to-taupe-200' },
  { name: 'T-SHIRTS', slug: '/shop?category=t-shirts', gradient: 'from-gold-100 via-beige-100 to-gold-200' },
  { name: 'ACCESSORIES', slug: '/shop?category=accessories', gradient: 'from-taupe-200 via-gold-100 to-beige-200' },
  { name: 'BOTTOMS', slug: '/shop?category=bottoms', gradient: 'from-ivory-200 via-gold-50 to-taupe-200' },
  { name: 'OUTERWEAR', slug: '/shop?category=outerwear', gradient: 'from-beige-300 via-gold-200 to-taupe-300' },
]

export default function ShopByCategory() {
  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">
            Shop by Category
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl lg:text-5xl">
            Discover wardrobe essentials by edit.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.55 }}
            >
              <Link to={category.slug} className="group block">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-ivory-200 bg-white/90 p-8 shadow-[0_20px_60px_-30px_rgba(31,26,23,0.2)] transition-transform duration-400 hover:-translate-y-1 hover:shadow-[0_28px_85px_-28px_rgba(31,26,23,0.24)]">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 transition-transform duration-500 ease-out group-hover:scale-105`}
                  />
                  <div className="relative flex h-full flex-col justify-end gap-3">
                    <span className="text-sm font-medium uppercase tracking-[0.26em] text-charcoal/80">
                      {category.name}
                    </span>
                    <span className="text-xs uppercase tracking-[0.24em] text-gold-600">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
