import type { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  emptyMessage?: string
}

export default function ProductGrid({ products, loading, emptyMessage = 'No products found.' }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-ivory-200 mb-3" />
            <div className="h-4 bg-ivory-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-ivory-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-sans text-charcoal/70">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
