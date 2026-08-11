import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, Order } from '@/types'

interface AuthContextType {
  user: Profile | null
  orders: Order[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshOrders: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getClient() {
  if (!supabase) return null
  return supabase
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const client = getClient()
    if (!client) {
      setIsLoading(false)
      return
    }

    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setUser(data as Profile)
      }
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setUser(data as Profile)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const client = getClient()
    if (!client) return { error: 'Application not configured. Please set up Supabase credentials.' }
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const client = getClient()
    if (!client) return { error: 'Application not configured. Please set up Supabase credentials.' }
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message }
    return {}
  }

  const logout = async () => {
    const client = getClient()
    if (!client) return
    await client.auth.signOut()
    setUser(null)
    setOrders([])
  }

  const refreshOrders = async () => {
    const client = getClient()
    if (!client || !user) return
    const { data } = await client
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setOrders(data as Order[])
  }

  return (
    <AuthContext.Provider value={{ user, orders, isLoading, login, signup, logout, refreshOrders }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}