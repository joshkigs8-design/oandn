import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant | null, quantity: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('on_cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('on_cart', JSON.stringify(items))
    }
  }, [items, isLoading])

  const addItem = (product: Product, variant: ProductVariant | null, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.product_id === product.id && item.variant_id === variant?.id)
      if (existing) {
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, {
        id: crypto.randomUUID(),
        product_id: product.id,
        variant_id: variant?.id || null,
        quantity,
        product,
        variant: variant || null,
      }]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.variant?.sale_price ?? item.variant?.price ?? item.product.price) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isLoading }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
