import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function AdminLogin() {
  const { user, login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-50">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-ivory-200 bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gold-600">Admin Portal</p>
          <h1 className="mt-4 text-3xl font-serif text-charcoal">Sign in to continue</h1>
          <p className="mt-2 text-sm text-charcoal/70">Only authorized admin users can manage products, categories, orders, and store settings.</p>
        </div>

        {user ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
            <p className="font-medium">Signed in as a non-admin user.</p>
            <p className="text-sm">You do not have permission to access the admin portal.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/account" className="btn-secondary">My Account</Link>
              <Link to="/" className="btn-primary">Go Home</Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault()
              setError('')
              setIsSubmitting(true)
              const result = await login(email, password)
              if (result.error) {
                setError(result.error)
              } else {
                navigate('/admin', { replace: true })
              }
              setIsSubmitting(false)
            }}
            className="space-y-5"
          >
            <label className="block text-sm text-charcoal">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                required
              />
            </label>
            <label className="block text-sm text-charcoal">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm text-charcoal focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                required
              />
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="text-center text-sm text-charcoal/70">
              <p>
                Need an account? <Link to="/account" className="text-gold-600 hover:text-gold-700">Create one</Link>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
