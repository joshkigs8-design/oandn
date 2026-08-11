import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/shop/ProductFilters'
import { categories, products } from '@/lib/mockData'

export default function Shop() {
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory && selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        hoodies: '1',
        't-shirts': '2',
        jackets: '5',
        trousers: '4',
        dresses: '6',
        accessories: '3',
      }
      result = result.filter((p: typeof products[0]) => p.category_id === categoryMap[selectedCategory])
    }

    if (priceMin) {
      result = result.filter((p: typeof products[0]) => (p.sale_price ?? p.price) >= Number(priceMin))
    }
    if (priceMax) {
      result = result.filter((p: typeof products[0]) => (p.sale_price ?? p.price) <= Number(priceMax))
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a: typeof products[0], b: typeof products[0]) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price))
        break
      case 'price-desc':
        result.sort((a: typeof products[0], b: typeof products[0]) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price))
        break
      case 'popular':
        result.sort((a: typeof products[0], b: typeof products[0]) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0))
        break
      default:
        result.sort((a: typeof products[0], b: typeof products[0]) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [selectedCategory, sortBy, priceMin, priceMax])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
        <Link to="/" className="text-charcoal/70 hover:text-gold-600 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 text-charcoal/50" />
        <span className="text-charcoal font-medium">Shop</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-4xl text-charcoal">SHOP</h1>
        <p className="font-sans text-charcoal/70 mt-2">Discover the O&amp;N collection.</p>
      </div>

      <div className="lg:hidden mb-6 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category: { id: string; name: string; slug: string }) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-sans transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'border-ivory-300 text-charcoal hover:border-gold-400'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="flex-1 border border-ivory-300 rounded px-3 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-16 border border-ivory-300 rounded px-2 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-16 border border-ivory-300 rounded px-2 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            priceMin={priceMin ? Number(priceMin) : null}
            priceMax={priceMax ? Number(priceMax) : null}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
          />
        </aside>
        <main className="flex-1">
          <ProductGrid products={filteredProducts} loading={loading} emptyMessage="No products match your filters." />
          {filteredProducts.length > 0 && !loading && (
            <div className="mt-12 text-center">
              <button className="btn-primary">Load More</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
