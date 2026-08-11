import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Minus, Plus, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import ProductGallery from '@/components/products/ProductGallery'
import ProductCard from '@/components/products/ProductCard'
import { useCart } from '@/context/CartContext'
import { products } from '@/lib/mockData'

const colorMap: Record<string, string> = {
  Beige: 'bg-beige-300',
  Black: 'bg-charcoal',
  White: 'bg-ivory-100 border-2 border-ivory-300',
  Brown: 'bg-taupe-500',
  Navy: 'bg-charcoal-light',
  Gold: 'bg-gold-400',
  Cream: 'bg-ivory-200',
  Blue: 'bg-charcoal-light',
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

interface AccordionSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

function AccordionSection({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border border-ivory-300 rounded">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 font-serif text-left text-charcoal"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 font-sans text-sm text-charcoal/70">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [wishlist, setWishlist] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const product = useMemo(() => products.find((p: typeof products[0]) => p.slug === slug), [slug])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [slug])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products.filter((p: typeof products[0]) => p.id !== product.id && p.category_id === product.category_id).slice(0, 4)
  }, [product])

  const availableColors = useMemo(() => {
    if (!product) return []
    return [...new Set(product.variants.map((v: { color: string | null }) => v.color).filter((c: string | null): c is string => c != null))]
  }, [product])

  const availableSizes = useMemo(() => {
    if (!product) return []
    return [...new Set(product.variants.map((v: { size: string | null }) => v.size).filter(Boolean))] as string[]
  }, [product])

  const displayPrice = product!.sale_price ?? product!.price
  const originalPrice = product!.sale_price ? product!.price : null

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!selectedSize) {
      setError('Please select a size.')
      return
    }
    setError(null)
    const variant = product.variants.find((v: { size: string | null }) => v.size === selectedSize) || product.variants[0] || null
    addItem(product, variant, quantity)
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!selectedSize) {
      setError('Please select a size.')
      return
    }
    setError(null)
    const variant = product.variants.find((v: { size: string | null }) => v.size === selectedSize) || product.variants[0] || null
    addItem(product, variant, quantity)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-6 bg-ivory-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-ivory-200" />
            <div className="space-y-4">
              <div className="h-8 bg-ivory-200 rounded w-3/4" />
              <div className="h-6 bg-ivory-200 rounded w-1/4" />
              <div className="h-4 bg-ivory-200 rounded w-full" />
              <div className="h-4 bg-ivory-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h1>
        <p className="font-sans text-charcoal/70 mb-8">The product you are looking for does not exist.</p>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
        <Link to="/" className="text-charcoal/70 hover:text-gold-600 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 text-charcoal/50" />
        <Link to="/shop" className="text-charcoal/70 hover:text-gold-600 transition-colors">Shop</Link>
        <ChevronRight className="h-4 w-4 text-charcoal/50" />
        <span className="text-charcoal font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <h1 className="font-serif text-3xl text-charcoal">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-serif text-2xl text-gold-600">KES {displayPrice.toLocaleString()}</span>
            {originalPrice && (
              <span className="font-sans text-base text-charcoal/50 line-through">KES {originalPrice.toLocaleString()}</span>
            )}
          </div>
          <p className="font-sans text-sm text-charcoal/70 mt-4 leading-relaxed">{product.description}</p>

          {availableColors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal mb-3">Color</h3>
              <div className="flex gap-3">
                {availableColors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      selectedColor === color ? 'border-gold-500 scale-110' : 'border-ivory-300'
                    } ${colorMap[color] || 'bg-ivory-300'}`}
                    aria-label={color || 'Color'}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal mb-3">Size</h3>
            <div className="grid grid-cols-6 gap-2">
              {sizes.map(size => {
                const isAvailable = availableSizes.includes(size)
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 border rounded text-xs font-sans font-semibold transition-colors ${
                      selectedSize === size
                        ? 'bg-gold-500 text-white border-gold-500'
                        : isAvailable
                          ? 'border-gold-200 text-charcoal hover:border-gold-400'
                          : 'border-ivory-300 text-charcoal/30 cursor-not-allowed'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 font-sans">{error}</p>
          )}

          <div className="mt-6">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal mb-3">Quantity</h3>
            <div className="flex items-center border border-ivory-300 rounded w-fit">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-sans text-sm font-semibold text-charcoal">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                className="p-3 text-charcoal hover:text-gold-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={handleAddToCart} className="btn-primary w-full">ADD TO CART</button>
            <button onClick={handleBuyNow} className="btn-secondary w-full">BUY NOW</button>
          </div>

          <button
            onClick={() => setWishlist(!wishlist)}
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-ivory-300 rounded font-sans text-xs font-semibold uppercase tracking-widest text-charcoal hover:border-gold-400 transition-colors"
            aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${wishlist ? 'fill-gold-500 text-gold-500' : ''}`} />
            {wishlist ? 'WISHLISTED' : 'ADD TO WISHLIST'}
          </button>

          <div className="mt-8 space-y-3">
            <AccordionSection title="Product Details" isOpen={openAccordion === 'details'} onToggle={() => toggleAccordion('details')}>
              <p>{product.description}</p>
              <p className="mt-2">SKU: {product.sku}</p>
            </AccordionSection>
            <AccordionSection title="Shipping &amp; Returns" isOpen={openAccordion === 'shipping'} onToggle={() => toggleAccordion('shipping')}>
              <p>Free delivery on orders above KES 5,000. Returns accepted within 14 days of delivery.</p>
            </AccordionSection>
            <AccordionSection title="Size Guide" isOpen={openAccordion === 'size'} onToggle={() => toggleAccordion('size')}>
              <p>XS: 34-36 inches chest, S: 36-38, M: 38-40, L: 40-42, XL: 42-44, XXL: 44-46.</p>
            </AccordionSection>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16 lg:mt-24">
          <h2 className="font-serif text-3xl text-charcoal mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
