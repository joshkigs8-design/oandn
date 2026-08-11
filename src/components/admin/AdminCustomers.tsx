import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert(error.message)
      }

      if (data) {
        setCustomers(data as Profile[])
      }
      setIsLoading(false)
    }

    loadCustomers()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (customer) =>
        customer.full_name?.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.phone?.toLowerCase().includes(q)
    )
  }, [customers, search])

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif text-charcoal">Customers</h1>
          <p className="text-sm text-charcoal-light">Review customer profiles and account details.</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-ivory-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-ivory-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory-50 text-charcoal-light">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-ivory-50 transition-colors">
                <td className="px-4 py-3 text-charcoal font-medium">{customer.full_name || 'Guest'}</td>
                <td className="px-4 py-3 text-charcoal">{customer.email}</td>
                <td className="px-4 py-3 text-charcoal">{customer.phone || '—'}</td>
                <td className="px-4 py-3 text-charcoal capitalize">{customer.role}</td>
                <td className="px-4 py-3 text-charcoal-light">{new Date(customer.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
