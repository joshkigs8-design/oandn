import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, User, Package, MapPin, Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Address } from '@/types'

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist'

export default function AccountPage() {
  const { user, orders, isLoading, logout, refreshOrders } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', county: '', town: '', address_line: '', is_default: false })
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phone: '' })
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      const saved = localStorage.getItem('on_addresses')
      if (saved) {
        try { setAddresses(JSON.parse(saved)) } catch {}
      }
    }
  }, [user])

  useEffect(() => {
    if (user) refreshOrders()
  }, [user, refreshOrders])

  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem('on_addresses', JSON.stringify(addresses))
    }
  }, [addresses])

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
  ]

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    const addr: Address = {
      id: crypto.randomUUID(),
      full_name: newAddress.full_name,
      phone: newAddress.phone,
      county: newAddress.county,
      town: newAddress.town,
      address_line: newAddress.address_line,
      is_default: newAddress.is_default
    }
    setAddresses([...addresses, addr])
    setNewAddress({ full_name: '', phone: '', county: '', town: '', address_line: '', is_default: false })
    setShowAddressForm(false)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Account</h1>
        <p className="text-taupe-500 mb-8">Please sign in to view your account.</p>
        <Link to="/" className="btn-primary">Go to Homepage</Link>
      </div>
    )
  }

  const inputClass = "w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl text-charcoal mb-8">My Account</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <aside className="lg:col-span-3 mb-8 lg:mb-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gold-50 text-gold-700' : 'text-charcoal hover:bg-taupe-50'}`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4">
              Sign Out
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-6">Profile</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label htmlFor="profile-name" className="block text-sm font-medium text-charcoal mb-1">Display Name</label>
                    <input type="text" id="profile-name" value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="block text-sm font-medium text-charcoal mb-1">Email</label>
                    <input type="email" id="profile-email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                    <input type="tel" id="profile-phone" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className={inputClass} />
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                  {profileSaved && <p className="text-sm text-green-600">Profile updated successfully!</p>}
                </form>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-6">Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-taupe-500 text-sm">You have no orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-taupe-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-charcoal">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-taupe-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gold-100 text-gold-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-taupe-500">{order.items?.length || 0} items</p>
                          <p className="font-medium text-charcoal">KES {order.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl text-charcoal">Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700 font-medium">
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-ivory-50 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="addr-name" className="block text-sm font-medium text-charcoal mb-1">Full Name</label>
                        <input type="text" id="addr-name" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} className={inputClass} required />
                      </div>
                      <div>
                        <label htmlFor="addr-phone" className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                        <input type="tel" id="addr-phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className={inputClass} required />
                      </div>
                      <div>
                        <label htmlFor="addr-county" className="block text-sm font-medium text-charcoal mb-1">County</label>
                        <input type="text" id="addr-county" value={newAddress.county} onChange={e => setNewAddress({ ...newAddress, county: e.target.value })} className={inputClass} required />
                      </div>
                      <div>
                        <label htmlFor="addr-town" className="block text-sm font-medium text-charcoal mb-1">Town</label>
                        <input type="text" id="addr-town" value={newAddress.town} onChange={e => setNewAddress({ ...newAddress, town: e.target.value })} className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="addr-line" className="block text-sm font-medium text-charcoal mb-1">Address</label>
                      <input type="text" id="addr-line" value={newAddress.address_line} onChange={e => setNewAddress({ ...newAddress, address_line: e.target.value })} className={inputClass} required />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="addr-default" checked={newAddress.is_default} onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })} className="h-4 w-4 rounded border-taupe-300 text-gold-600 focus:ring-gold-500" />
                      <label htmlFor="addr-default" className="text-sm text-charcoal">Set as default address</label>
                    </div>
                    <button type="submit" className="btn-primary">Save Address</button>
                  </form>
                )}
                {addresses.length === 0 ? (
                  <p className="text-taupe-500 text-sm">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div key={addr.id} className="border border-taupe-200 rounded-lg p-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-charcoal">{addr.full_name}</p>
                          <p className="text-sm text-taupe-500">{addr.address_line}, {addr.town}, {addr.county}</p>
                          <p className="text-sm text-taupe-500">{addr.phone}</p>
                          {addr.is_default && <span className="inline-block mt-1 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <button onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))} className="text-gold-600 hover:text-gold-700" aria-label="Remove address">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-taupe-200 p-6 shadow-sm">
                <h2 className="font-serif text-xl text-charcoal mb-6">Wishlist</h2>
                <p className="text-taupe-500 text-sm">Your wishlist is empty. Browse our <Link to="/shop" className="text-gold-600 hover:text-gold-700">collection</Link> to add items.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
