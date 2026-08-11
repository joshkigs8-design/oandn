import { Link } from 'react-router-dom'

const footerLinks = {
  shop: [
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'Collections', to: '/shop?filter=collections' },
    { label: 'Best Sellers', to: '/shop?filter=best-sellers' },
    { label: 'Sale', to: '/shop?filter=sale' },
  ],
  care: [
    { label: 'Shipping', to: '/shipping' },
    { label: 'Returns', to: '/returns' },
    { label: 'Size Guide', to: '/size-guide' },
    { label: 'FAQs', to: '/faqs' },
  ],
}

const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
]

export default function Footer() {
  return (
    <footer className="bg-ivory-100 border-t border-ivory-200 text-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link to="/" className="inline-block font-serif text-3xl uppercase tracking-[0.2em] text-charcoal">
              O&amp;N
            </Link>
            <p className="max-w-md text-sm leading-7 text-charcoal/70">
              A premium fashion brand rooted in quiet luxury, refined essentials, and elevated everyday style.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 uppercase tracking-[0.18em]">Shop</h3>
            <ul className="space-y-3 text-sm text-charcoal/70">
              {footerLinks.shop.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-gold-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 uppercase tracking-[0.18em]">Customer Care</h3>
            <ul className="space-y-3 text-sm text-charcoal/70">
              {footerLinks.care.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-gold-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 uppercase tracking-[0.18em]">Contact</h3>
            <div className="space-y-3 text-sm text-charcoal/70">
              <a href="mailto:hello@onfashion.co.ke" className="block transition-colors hover:text-gold-600">
                hello@onfashion.co.ke
              </a>
              <a href="tel:+254700000000" className="block transition-colors hover:text-gold-600">
                +254 700 000 000
              </a>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-ivory-200 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-charcoal/50">© 2026 O&amp;N. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-charcoal/60">
            {socials.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gold-600"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
