import type { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string | null
  sortBy?: string
  priceMin?: number | null
  priceMax?: number | null
  onCategoryChange: (slug: string | null) => void
  onSortChange: (value: string) => void
  onPriceMinChange: (value: string) => void
  onPriceMaxChange: (value: string) => void
}

export default function ProductFilters({
  categories,
  selectedCategory,
  sortBy,
  priceMin,
  priceMax,
  onCategoryChange,
  onSortChange,
  onPriceMinChange,
  onPriceMaxChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg text-charcoal mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryChange(selectedCategory === category.slug ? null : category.slug)}
                className={`font-sans text-sm transition-colors ${
                  selectedCategory === category.slug
                    ? 'text-gold-600 font-semibold'
                    : 'text-charcoal/70 hover:text-gold-600'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-serif text-lg text-charcoal mb-3">Sort By</h3>
        <select
          value={sortBy || 'newest'}
          onChange={e => onSortChange(e.target.value)}
          className="w-full border border-ivory-300 rounded px-3 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <div>
        <h3 className="font-serif text-lg text-charcoal mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin ?? ''}
            onChange={e => onPriceMinChange(e.target.value)}
            className="w-full border border-ivory-300 rounded px-3 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
          />
          <span className="text-charcoal/50">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax ?? ''}
            onChange={e => onPriceMaxChange(e.target.value)}
            className="w-full border border-ivory-300 rounded px-3 py-2 font-sans text-sm text-charcoal bg-white focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>
    </div>
  )
}
