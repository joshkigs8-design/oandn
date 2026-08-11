import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/types'

const newArrivals: Product[] = [
  {
    id: '1',
    name: 'Essential Relaxed Hoodie',
    slug: 'essential-relaxed-hoodie',
    price: 4500,
    sale_price: null,
    images: [{ id: 'img-1', product_id: '1', image_url: '', alt_text: '', sort_order: 0 }],
    variants: [{ id: 'v1', product_id: '1', size: 'S', color: null, sku: '', stock_quantity: 10, price: 4500, sale_price: null }],
    is_new_arrival: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 10,
    sku: '',
    created_at: '2025-01-01',
    category_id: '1',
    description: '',
  },
  {
    id: '2',
    name: 'Classic Crewneck Tee',
    slug: 'classic-crewneck-tee',
    price: 2200,
    sale_price: 1800,
    images: [{ id: 'img-2', product_id: '2', image_url: '', alt_text: '', sort_order: 0 }],
    variants: [{ id: 'v2', product_id: '2', size: 'S', color: null, sku: '', stock_quantity: 10, price: 2200, sale_price: 1800 }],
    is_new_arrival: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 10,
    sku: '',
    created_at: '2025-01-01',
    category_id: '2',
    description: '',
  },
  {
    id: '3',
    name: 'Structured Canvas Tote',
    slug: 'structured-canvas-tote',
    price: 3200,
    sale_price: null,
    images: [{ id: 'img-3', product_id: '3', image_url: '', alt_text: '', sort_order: 0 }],
    variants: [{ id: 'v3', product_id: '3', size: null, color: null, sku: '', stock_quantity: 10, price: 3200, sale_price: null }],
    is_new_arrival: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 10,
    sku: '',
    created_at: '2025-01-01',
    category_id: '3',
    description: '',
  },
  {
    id: '4',
    name: 'Tailored Tapered Trousers',
    slug: 'tailored-tapered-trousers',
    price: 3800,
    sale_price: null,
    images: [{ id: 'img-4', product_id: '4', image_url: '', alt_text: '', sort_order: 0 }],
    variants: [{ id: 'v4', product_id: '4', size: 'S', color: null, sku: '', stock_quantity: 10, price: 3800, sale_price: null }],
    is_new_arrival: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 10,
    sku: '',
    created_at: '2025-01-01',
    category_id: '4',
    description: '',
  },
  {
    id: '5',
    name: 'Oversized Bomber Jacket',
    slug: 'oversized-bomber-jacket',
    price: 6500,
    sale_price: 5200,
    images: [{ id: 'img-5', product_id: '5', image_url: '', alt_text: '', sort_order: 0 }],
    variants: [{ id: 'v5', product_id: '5', size: 'S', color: null, sku: '', stock_quantity: 10, price: 6500, sale_price: 5200 }],
    is_new_arrival: true,
    is_featured: false,
    is_best_seller: false,
    stock_quantity: 10,
    sku: '',
    created_at: '2025-01-01',
    category_id: '5',
    description: '',
  },
]

export default function NewArrivals() {
  return (
    <section className="py-20 md:py-28 bg-ivory-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-sans text-xs uppercase tracking-[0.24em] text-gold-600">
            NEW ARRIVALS
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-4xl lg:text-5xl">
            Fresh pieces for the modern wardrobe.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.55 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/shop?filter=new" className="btn-secondary">
            VIEW ALL NEW ARRIVALS
          </Link>
        </div>
      </div>
    </section>
  )
}
