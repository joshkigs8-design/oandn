import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  const deliveryFee = totalPrice >= 5000 ? 0 : 300
  const total = totalPrice + deliveryFee

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Shopping Bag</h1>
        <p className="text-taupe-500 mb-8 font-sans">Your bag is empty.</p>
        <Link to="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-serif text-3xl text-charcoal">
          Shopping Bag <span className="text-lg text-taupe-500 font-sans ml-2">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <ul role="list" className="-my-6 divide-y divide-taupe-200">
            <AnimatePresence>
              {items.map((item) => {
                const imageUrl = item.product.images[0]?.image_url || ''
                const unitPrice = item.variant?.sale_price ?? item.variant?.price ?? item.product.price
                const lineTotal = unitPrice * item.quantity

                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex py-6"
                  >
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-taupe-200">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.product.name} className="h-24 w-24 object-cover object-center" />
                      ) : (
                        <div className="h-24 w-24 bg-taupe-100 flex items-center justify-center text-taupe-400 text-xs">No image</div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-charcoal">
                          <h3>
                            <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                          </h3>
                          <p className="ml-4">KES {lineTotal.toLocaleString()}</p>
                        </div>
                        <p className="mt-1 text-sm text-taupe-500">
                          {item.variant?.size ? `Size: ${item.variant.size}` : ''}
                          {item.variant?.size && item.variant?.color ? ' / ' : ''}
                          {item.variant?.color ? `Color: ${item.variant.color}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border border-taupe-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-taupe-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4 text-taupe-500" />
                          </button>
                          <span className="px-3 py-1.5 text-sm text-charcoal min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-taupe-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4 text-taupe-500" />
                          </button>
                        </div>
                        <p className="text-taupe-500">KES {unitPrice.toLocaleString()} each</p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gold-600 hover:text-gold-700 text-sm flex items-center gap-1"
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </div>

        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="sticky top-24 bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-charcoal mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-charcoal">
                <p>Subtotal</p>
                <p>KES {totalPrice.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm text-charcoal">
                <p>Delivery fee</p>
                <p>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `KES ${deliveryFee}`}</p>
              </div>
              <div className="border-t border-taupe-200 pt-4 flex justify-between text-base font-semibold text-charcoal">
                <p>Total</p>
                <p>KES {total.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/checkout" className="btn-primary w-full block text-center">
                Checkout
              </Link>
            </div>
            <div className="mt-3 text-center">
              <Link to="/shop" className="font-sans text-sm text-gold-600 hover:text-gold-700">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
