import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Lock, Headphones } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'On all orders above KES 5,000 island-wide.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentic Quality',
    description: 'Premium fabrics sourced from trusted mills.',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    description: 'Your payment details are protected with every order.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Friendly local service ready to help when you need it.',
  },
]

export default function WhyShop() {
  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.55 }}
              className="rounded-[1.75rem] border border-ivory-200 bg-white/90 p-8 text-center shadow-[0_24px_72px_-36px_rgba(31,26,23,0.18)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-serif text-lg text-charcoal">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
