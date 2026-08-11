import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react'

const stats = [
  { label: 'Total Sales', value: 'KES 482,500', icon: DollarSign, color: 'text-gold-600' },
  { label: 'Orders', value: '128', icon: ShoppingCart, color: 'text-gold-600' },
  { label: 'Customers', value: '1,245', icon: Users, color: 'text-gold-600' },
  { label: 'Products', value: '86', icon: Package, color: 'text-gold-600' },
  { label: 'Low Stock', value: '7', icon: AlertTriangle, color: 'text-red-600' },
]

const recentOrders = [
  { id: 'ORD-7841', customer: 'Jane Mwangi', amount: 12500, status: 'Delivered', payment: 'Paid', date: '2026-08-10' },
  { id: 'ORD-7840', customer: 'David Ochieng', amount: 8900, status: 'Processing', payment: 'Pending', date: '2026-08-10' },
  { id: 'ORD-7839', customer: 'Grace Wanjiku', amount: 21000, status: 'Shipped', payment: 'Paid', date: '2026-08-09' },
  { id: 'ORD-7838', customer: 'Peter Kipchoge', amount: 5600, status: 'Cancelled', payment: 'Failed', date: '2026-08-09' },
  { id: 'ORD-7837', customer: 'Sarah Njeri', amount: 17400, status: 'Delivered', payment: 'Paid', date: '2026-08-08' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-charcoal">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-lg border border-ivory-200 p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-charcoal-light font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-semibold text-charcoal mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-ivory-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-ivory-200">
          <h2 className="text-lg font-serif text-charcoal">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory-50 text-charcoal-light">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Order ID</th>
                <th className="text-left px-6 py-3 font-medium">Customer</th>
                <th className="text-left px-6 py-3 font-medium">Amount</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Payment</th>
                <th className="text-left px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="px-6 py-3 text-charcoal font-medium">{order.id}</td>
                  <td className="px-6 py-3 text-charcoal">{order.customer}</td>
                  <td className="px-6 py-3 text-charcoal">KES {order.amount.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' || order.status === 'Shipped'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Processing'
                        ? 'bg-gold-100 text-gold-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.payment === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : order.payment === 'Pending'
                        ? 'bg-gold-100 text-gold-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-charcoal-light">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
