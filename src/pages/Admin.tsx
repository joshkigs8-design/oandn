import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminCategories from '@/components/admin/AdminCategories'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminCustomers from '@/components/admin/AdminCustomers'
import AdminSettings from '@/components/admin/AdminSettings'
import { useAuth } from '@/context/AuthContext'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/admin/login', { replace: true })
    return null
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-ivory-200 p-8 text-center max-w-md">
          <h1 className="text-2xl font-serif text-charcoal mb-2">Access Denied</h1>
          <p className="text-charcoal-light">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'products':
        return <AdminProducts />
      case 'categories':
        return <AdminCategories />
      case 'orders':
        return <AdminOrders />
      case 'customers':
        return <AdminCustomers />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-ivory-50">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <div className="lg:hidden flex items-center gap-3 p-4 bg-ivory-100 border-b border-ivory-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-ivory-200 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-charcoal" /> : <Menu className="w-5 h-5 text-charcoal" />}
          </button>
          <span className="font-serif text-lg text-charcoal">Admin</span>
        </div>
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
