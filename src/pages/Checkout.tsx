import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import type { Order } from '@/types'

const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
]

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()

  const deliveryFee = totalPrice >= 5000 ? 0 : 300
  const total = totalPrice + deliveryFee

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    county: '',
    town: '',
    address: '',
    instructions: '',
    paymentMethod: 'cash' as 'mpesa' | 'cash',
    mpesaPhone: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+?254/, '0').replace(/^0/, '')
    return /^[17]\d{8}$/.test(cleaned)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Enter a valid Kenyan phone number'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address'
    if (!formData.county) newErrors.county = 'County is required'
    if (!formData.town.trim()) newErrors.town = 'Town is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (formData.paymentMethod === 'mpesa') {
      if (!formData.mpesaPhone.trim()) newErrors.mpesaPhone = 'M-Pesa phone number is required'
      else if (!validatePhone(formData.mpesaPhone)) newErrors.mpesaPhone = 'Enter a valid M-Pesa phone number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const newOrder: Order = {
        id: crypto.randomUUID(),
        user_id: null,
        status: 'Order Placed',
        payment_status: 'Pending',
        payment_method: formData.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery',
        transaction_ref: null,
        subtotal: totalPrice,
        delivery_fee: deliveryFee,
        total: total,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_county: formData.county,
        delivery_town: formData.town,
        delivery_address: formData.address,
        delivery_instructions: formData.instructions || null,
        items: items.map(item => ({
          id: crypto.randomUUID(),
          order_id: '',
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product.name,
          variant_label: item.variant ? `${item.variant.size || ''} ${item.variant.color || ''}`.trim() : null,
          quantity: item.quantity,
          unit_price: item.variant?.sale_price ?? item.variant?.price ?? item.product.price,
          total_price: (item.variant?.sale_price ?? item.variant?.price ?? item.product.price) * item.quantity,
          product_image_url: item.product.images[0]?.image_url || null
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setOrderId(newOrder.id)
      setOrderPlaced(true)
      clearCart()
    } catch (error) {
      console.error('Order placement failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced && orderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl border border-taupe-200 p-8 text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-charcoal mb-2">Order Confirmed</h1>
          <p className="text-taupe-500 mb-1">Thank you for your order!</p>
          <p className="text-sm text-charcoal mb-6">
            Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-xs text-taupe-500 mb-6">M-Pesa integration coming soon. For now, orders will be processed as pending.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/account')} className="btn-primary w-full">
              Track Order
            </button>
            <Link to="/shop" className="btn-secondary w-full text-center">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Checkout</h1>
        <p className="text-taupe-500 mb-8 font-sans">Your bag is empty.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  const inputClass = (field: string) =>
    `w-full rounded-md border ${errors[field] ? 'border-red-400' : 'border-taupe-200'} bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-charcoal mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
              <h2 className="font-serif text-lg text-charcoal mb-4">Contact</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-charcoal mb-1">Full Name *</label>
                  <input type="text" id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass('fullName')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1">Phone Number *</label>
                  <input type="tel" id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass('phone')} placeholder="e.g. 0712345678" />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">Email *</label>
                  <input type="email" id="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
              <h2 className="font-serif text-lg text-charcoal mb-4">Delivery</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-charcoal mb-1">County *</label>
                  <select id="county" value={formData.county} onChange={e => setFormData({ ...formData, county: e.target.value })} className={inputClass('county')}>
                    <option value="">Select county</option>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.county && <p className="mt-1 text-xs text-red-500">{errors.county}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="town" className="block text-sm font-medium text-charcoal mb-1">Town *</label>
                    <input type="text" id="town" value={formData.town} onChange={e => setFormData({ ...formData, town: e.target.value })} className={inputClass('town')} />
                    {errors.town && <p className="mt-1 text-xs text-red-500">{errors.town}</p>}
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-charcoal mb-1">Address *</label>
                    <input type="text" id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputClass('address')} />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-charcoal mb-1">Additional Instructions</label>
                  <textarea id="instructions" rows={3} value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} className={inputClass('instructions')} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
              <h2 className="font-serif text-lg text-charcoal mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="mpesa" checked={formData.paymentMethod === 'mpesa'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as 'mpesa' | 'cash' })} className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-taupe-300" />
                  <span className="text-sm font-medium text-charcoal">M-Pesa</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as 'mpesa' | 'cash' })} className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-taupe-300" />
                  <span className="text-sm font-medium text-charcoal">Cash on Delivery</span>
                </label>
              </div>
              <AnimatePresence>
                {formData.paymentMethod === 'mpesa' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                    <label htmlFor="mpesaPhone" className="block text-sm font-medium text-charcoal mb-1">M-Pesa Phone Number *</label>
                    <input type="tel" id="mpesaPhone" value={formData.mpesaPhone} onChange={e => setFormData({ ...formData, mpesaPhone: e.target.value })} className={inputClass('mpesaPhone')} placeholder="e.g. 0712345678" />
                    {errors.mpesaPhone && <p className="mt-1 text-xs text-red-500">{errors.mpesaPhone}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-4 text-xs text-taupe-500 italic">M-Pesa integration coming soon. For now, orders will be processed as pending.</p>
            </div>
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-24 bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
              <h2 className="font-serif text-xl text-charcoal mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map(item => {
                  const imageUrl = item.product.images[0]?.image_url || ''
                  const unitPrice = item.variant?.sale_price ?? item.variant?.price ?? item.product.price
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-taupe-200">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="h-12 w-12 object-cover" />
                        ) : (
                          <div className="h-12 w-12 bg-taupe-100" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{item.product.name}</p>
                        <p className="text-xs text-taupe-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-charcoal">KES {(unitPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  )
                })}
                <div className="border-t border-taupe-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-charcoal">
                    <p>Subtotal</p>
                    <p>KES {totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between text-sm text-charcoal">
                    <p>Delivery fee</p>
                    <p>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `KES ${deliveryFee}`}</p>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-charcoal pt-2 border-t border-taupe-200">
                    <p>Total</p>
                    <p>KES {total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
