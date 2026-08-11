import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'

const statuses = [
  'Order Placed',
  'Payment Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert(error.message)
      }

      if (data) {
        setOrders(data.map((order) => ({ ...order, items: [] })) as Order[])
      }

      setIsLoading(false)
    }

    loadOrders()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => o.status === filter || o.payment_status === filter)
  }, [orders, filter])

  const updateStatus = async (order: Order, field: 'status' | 'payment_status', value: string) => {
    if (!supabase) return

    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', order.id)

    if (error) {
      alert(error.message)
      return
    }

    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, [field]: value } : o)))
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...selectedOrder, [field]: value } as Order)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'Delivered':
      case 'Paid':
        return 'bg-green-100 text-green-800'
      case 'Processing':
      case 'Pending':
      case 'Packed':
      case 'Shipped':
      case 'Out for Delivery':
      case 'Payment Confirmed':
        return 'bg-gold-100 text-gold-800'
      case 'Cancelled':
      case 'Failed':
      case 'Refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-charcoal">Orders</h1>

      <div className="bg-white rounded-lg border border-ivory-200">
        <div className="p-4 border-b border-ivory-200 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-charcoal-light">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          >
            <option value="all">All Orders</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Pending">Payment Pending</option>
            <option value="Paid">Payment Paid</option>
            <option value="Failed">Payment Failed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory-50 text-charcoal-light">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Order Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="px-4 py-3 text-charcoal font-medium">ORD-{order.id}</td>
                  <td className="px-4 py-3 text-charcoal">{order.customer_name}</td>
                  <td className="px-4 py-3 text-charcoal">{order.customer_phone}</td>
                  <td className="px-4 py-3 text-charcoal">KES {Number(order.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order, 'status', e.target.value)}
                        className={`appearance-none pr-8 pl-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor(order.status)}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-light">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs text-gold-600 hover:text-gold-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedOrder(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg border border-ivory-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-ivory-200">
                <h3 className="text-lg font-serif text-charcoal">Order ORD-{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-1 rounded hover:bg-ivory-100">
                  <X className="w-5 h-5 text-charcoal-light" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wider mb-2">Customer Information</h4>
                  <div className="bg-ivory-50 rounded-md p-4 text-sm text-charcoal space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wider mb-2">Delivery Address</h4>
                  <div className="bg-ivory-50 rounded-md p-4 text-sm text-charcoal">
                    <p>{selectedOrder.delivery_address}</p>
                    <p>{selectedOrder.delivery_town}, {selectedOrder.delivery_county}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wider mb-2">Payment Information</h4>
                  <div className="bg-ivory-50 rounded-md p-4 text-sm text-charcoal space-y-1">
                    <p><span className="font-medium">Method:</span> {selectedOrder.payment_method || '—'}</p>
                    <p><span className="font-medium">Reference:</span> {selectedOrder.transaction_ref || '—'}</p>
                    <p><span className="font-medium">Status:</span> <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(selectedOrder.payment_status)}`}>{selectedOrder.payment_status}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-charcoal-light uppercase tracking-wider mb-2">Order Summary</h4>
                  <div className="bg-ivory-50 rounded-md p-4 text-sm text-charcoal space-y-1">
                    <p>Subtotal: KES {Number(selectedOrder.subtotal).toLocaleString()}</p>
                    <p>Delivery Fee: KES {Number(selectedOrder.delivery_fee).toLocaleString()}</p>
                    <p className="font-semibold text-charcoal">Total: KES {Number(selectedOrder.total).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-5 border-t border-ivory-200">
                <button onClick={() => setSelectedOrder(null)} className="btn-secondary">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
