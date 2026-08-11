import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type Tab = 'signin' | 'signup'

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, signup } = useAuth()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setError('')
  }

  const switchTab = (newTab: Tab) => {
    setTab(newTab)
    resetForm()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
      resetForm()
    }
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setIsLoading(true)
    const result = await signup(email, password, fullName)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
      resetForm()
    }
    setIsLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-taupe-500 hover:text-charcoal transition-colors z-10" aria-label="Close">
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="flex border-b border-taupe-200 mb-6">
                <button
                  onClick={() => switchTab('signin')}
                  className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${tab === 'signin' ? 'text-gold-600 border-b-2 border-gold-600' : 'text-taupe-500 hover:text-charcoal'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('signup')}
                  className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${tab === 'signup' ? 'text-gold-600 border-b-2 border-gold-600' : 'text-taupe-500 hover:text-charcoal'}`}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                {tab === 'signin' ? (
                  <motion.form key="signin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="signin-email" className="block text-sm font-medium text-charcoal mb-1">Email</label>
                      <input type="email" id="signin-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required />
                    </div>
                    <div>
                      <label htmlFor="signin-password" className="block text-sm font-medium text-charcoal mb-1">Password</label>
                      <input type="password" id="signin-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <p className="text-center text-sm">
                      <button type="button" className="text-gold-600 hover:text-gold-700">Forgot password?</button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="signup-name" className="block text-sm font-medium text-charcoal mb-1">Full Name</label>
                      <input type="text" id="signup-name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required />
                    </div>
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-charcoal mb-1">Email</label>
                      <input type="email" id="signup-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required />
                    </div>
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-charcoal mb-1">Password</label>
                      <input type="password" id="signup-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required minLength={6} />
                    </div>
                    <div>
                      <label htmlFor="signup-confirm" className="block text-sm font-medium text-charcoal mb-1">Confirm Password</label>
                      <input type="password" id="signup-confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-md border border-taupe-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-taupe-400 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
