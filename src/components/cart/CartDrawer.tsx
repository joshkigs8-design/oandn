import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'

let triggerOpen: (() => void) | null = null

export function useCartDrawerTrigger() {
  return {
    openCart: () => triggerOpen?.(),
  }
}

export default function CartDrawer() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    triggerOpen = () => setIsOpen(true)
    return () => {
      triggerOpen = null
    }
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-ivory-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-ivory-200">
              <h2 className="font-serif text-xl text-charcoal">
                Shopping Bag
                <span className="ml-2 font-sans text-sm text-charcoal/50">
                  ({totalItems})
                </span>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="p-4 bg-ivory-100 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-charcoal/30" />
                  </div>
                  <p className="font-serif text-lg text-charcoal mb-2">Your bag is empty</p>
                  <p className="font-sans text-sm text-charcoal/60 mb-6">
                    Looks like you haven't added anything yet.
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-md hover:from-gold-600 hover:to-gold-700 transition-all shadow-sm"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => {
                     const imageUrl = item.product.images[0]?.image_url || '/placeholder.jpg'
                    const displayPrice = item.variant?.sale_price ?? item.variant?.price ?? item.product.price
                    const sizeLabel = item.variant?.size || item.variant?.color || null

                    return (
                      <div key={item.id} className="flex gap-4 bg-white rounded-lg p-3 border border-ivory-200">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="shrink-0"
                          onClick={() => setIsOpen(false)}
                        >
                          <img
                            src={imageUrl || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-20 h-24 object-cover rounded-md bg-ivory-100"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="font-serif text-sm text-charcoal hover:text-gold-600 transition-colors line-clamp-2"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.product.name}
                          </Link>
                          {sizeLabel && (
                            <p className="mt-1 font-sans text-xs text-charcoal/60 uppercase tracking-wider">
                              {sizeLabel}
                            </p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 border border-ivory-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 text-charcoal/70 hover:text-gold-600 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-xs font-sans text-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-charcoal/70 hover:text-gold-600 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-sans text-sm font-medium text-charcoal">
                              KES {displayPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="self-start p-1.5 text-charcoal/40 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ivory-200 p-4 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-charcoal/70 uppercase tracking-wider">Subtotal</span>
                  <span className="font-serif text-lg text-charcoal">
                    KES {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-center font-sans text-xs font-semibold uppercase tracking-widest border border-gold-400 text-charcoal rounded-md hover:bg-gold-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 text-center font-sans text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-md hover:from-gold-600 hover:to-gold-700 transition-all shadow-sm"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
