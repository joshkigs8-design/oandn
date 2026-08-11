import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCartDrawerTrigger } from '@/components/cart/CartDrawer'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?filter=new', label: 'New Arrivals' },
  { to: '/shop?filter=collections', label: 'Collections' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { totalItems } = useCart()
  const { openCart } = useCartDrawerTrigger()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const isActive = (path: string) => {
    if (path.includes('?')) {
      const [base] = path.split('?')
      return location.pathname === base && location.search.includes(path.split('?')[1])
    }
    return location.pathname === path
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-ivory-100/95 shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-charcoal hover:text-gold-600 transition-colors lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to="/"
                className="font-serif text-2xl tracking-tight text-gold-600 hover:text-gold-700 transition-colors"
              >
                O&amp;N
              </Link>
            </div>

            <nav className="hidden items-center gap-8 lg:flex">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative font-sans text-[0.78rem] uppercase tracking-[0.26em] transition-colors ${
                    isActive(link.to)
                      ? 'text-gold-600'
                      : 'text-charcoal hover:text-gold-600'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gold-500"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/search"
                className="p-2 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                to="/account"
                className="hidden sm:block p-2 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={openCart}
                className="relative p-2 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-ivory-50 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ivory-200 p-4">
                <Link
                  to="/"
                  className="font-serif text-2xl text-gold-600 tracking-tight"
                  onClick={() => setMobileOpen(false)}
                >
                  O&amp;N
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-charcoal hover:text-gold-600 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-6">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`py-3 text-sm uppercase tracking-[0.2em] border-b border-ivory-200 transition-colors ${
                      isActive(link.to)
                        ? 'text-gold-600 font-semibold'
                        : 'text-charcoal hover:text-gold-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 border-t border-ivory-200 p-6 flex items-center gap-4">
                <Link
                  to="/search"
                  className="p-2 text-charcoal hover:text-gold-600 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Link>
                <Link
                  to="/account"
                  className="p-2 text-charcoal hover:text-gold-600 transition-colors"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
