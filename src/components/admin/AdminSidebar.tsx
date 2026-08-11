import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Settings,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ activeTab, onTabChange, isOpen = false, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-ivory-100 border-r border-ivory-200 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-ivory-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white font-serif text-sm font-bold">
                O&N
              </div>
              <span className="font-serif text-lg text-charcoal tracking-wide">Admin</span>
            </div>
            <button
              className="lg:hidden p-1 rounded hover:bg-ivory-200"
              onClick={onClose}
            >
              <X className="w-5 h-5 text-charcoal" />
            </button>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    onClose?.()
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gold-50 text-gold-600'
                      : 'text-charcoal hover:bg-ivory-200 hover:text-charcoal'
                    }
                  `}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-ivory-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-serif text-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-charcoal-light truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-charcoal hover:bg-ivory-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
