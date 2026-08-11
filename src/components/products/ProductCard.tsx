import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [wishlist, setWishlist] = useState(false)
  const displayPrice = product.sale_price ?? product.price
  const originalPrice = product.sale_price ? product.price : null
  const availableSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[]

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-ivory-200 bg-white/90 shadow-[0_30px_90px_-40px_rgba(31,26,23,0.2)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_36px_105px_-36px_rgba(31,26,23,0.24)]">
        <div className="aspect-[3/4] bg-ivory-100">
          <div className="absolute inset-0 flex items-center justify-center bg-ivory-100 transition-transform duration-500 ease-out group-hover:scale-105">
            <span className="font-serif text-charcoal/20 text-2xl uppercase tracking-[0.3em]">O&amp;N</span>
          </div>
        </div>

        <div className="absolute right-3 top-3 z-10 space-y-2 text-right">
          {product.is_new_arrival && (
            <span className="inline-flex items-center rounded-full bg-charcoal text-ivory-50 px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
              New
            </span>
          )}
          {product.sale_price && (
            <span className="inline-flex items-center rounded-full bg-gold-500 text-white px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
              Sale
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            setWishlist(!wishlist)
          }}
          className="absolute left-3 top-3 z-20 rounded-full bg-white/95 p-2 text-charcoal opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
          aria-label={wishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${wishlist ? 'fill-gold-500 text-gold-500' : 'text-charcoal'}`} />
        </button>

        {availableSizes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-white/95 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex flex-wrap gap-2">
              {availableSizes.slice(0, 5).map(size => (
                <span key={size} className="rounded-full border border-ivory-300 bg-ivory-100 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-charcoal/70">
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 pb-5 pt-4">
          <h3 className="font-serif text-base text-charcoal transition-colors group-hover:text-gold-600">
            {product.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-sans text-sm font-semibold text-charcoal">
              KES {displayPrice.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="font-sans text-sm text-charcoal/50 line-through">
                KES {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              onAddToCart?.(product)
            }}
            className="mt-4 w-full rounded-full bg-charcoal px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:bg-charcoal-light"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
