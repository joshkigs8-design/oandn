import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-ivory-200 bg-white/95 p-10 shadow-[0_30px_90px_-40px_rgba(31,26,23,0.18)]"
        >
          <div className="text-center">
            <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">
              Join the Edit
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl">
              Stay ahead of every seasonal drop.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-charcoal/70">
              Get exclusive previews, early access, and private offers from O&amp;N. We only send curated updates you’ll actually love.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-full border border-ivory-200 bg-ivory-100 px-5 py-4 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-gold-500 focus:outline-none"
            />
            <button type="submit" className="btn-primary w-full sm:w-auto whitespace-nowrap">
              Subscribe
            </button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
