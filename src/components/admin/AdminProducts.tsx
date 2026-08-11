import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import type { Product, Category } from '@/types'

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Linen Blend Blazer',
    slug: 'linen-blend-blazer',
    description: 'Elegant linen blazer',
    price: 12500,
    sale_price: 9990,
    category_id: 'women',
    images: [],
    variants: [],
    is_new_arrival: true,
    is_featured: true,
    is_best_seller: false,
    stock_quantity: 24,
    sku: 'O&N-LBB-001',
    created_at: '2026-08-01',
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    slug: 'silk-evening-dress',
    description: 'Premium silk dress',
    price: 22000,
    sale_price: null,
    category_id: 'women',
    images: [],
    variants: [],
    is_new_arrival: false,
    is_featured: true,
    is_best_seller: true,
    stock_quantity: 3,
    sku: 'O&N-SED-002',
    created_at: '2026-07-20',
  },
]

const mockCategories: Category[] = [
  { id: '1', name: 'Women', slug: 'women', image_url: null, description: null, sort_order: 1, created_at: '' },
  { id: '2', name: 'Men', slug: 'men', image_url: null, description: null, sort_order: 2, created_at: '' },
  { id: '3', name: 'Accessories', slug: 'accessories', image_url: null, description: null, sort_order: 3, created_at: '' },
]

const defaultForm = {
  name: '',
  description: '',
  price: '',
  sale_price: '',
  category_id: '',
  sku: '',
  stock_quantity: '',
  is_new_arrival: false,
  is_featured: false,
  is_best_seller: false,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(defaultForm)

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    )
  }, [products, search])

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      category_id: product.category_id || '',
      sku: product.sku || '',
      stock_quantity: String(product.stock_quantity),
      is_new_arrival: product.is_new_arrival,
      is_featured: product.is_featured,
      is_best_seller: product.is_best_seller,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: form.name,
                description: form.description,
                price: parseFloat(form.price) || 0,
                sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
                category_id: form.category_id,
                sku: form.sku,
                stock_quantity: parseInt(form.stock_quantity) || 0,
                is_new_arrival: form.is_new_arrival,
                is_featured: form.is_featured,
                is_best_seller: form.is_best_seller,
              }
            : p
        )
      )
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        price: parseFloat(form.price) || 0,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category_id: form.category_id,
        images: [],
        variants: [],
        is_new_arrival: form.is_new_arrival,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        sku: form.sku,
        created_at: new Date().toISOString(),
      }
      setProducts((prev) => [...prev, newProduct])
    }
    setModalOpen(false)
    setEditing(null)
    setForm(defaultForm)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const statusLabel = (p: Product) => {
    if (p.stock_quantity <= 5) return 'Low Stock'
    if (p.is_new_arrival) return 'New'
    if (p.is_featured) return 'Featured'
    if (p.is_best_seller) return 'Best Seller'
    return 'Active'
  }

  const statusColor = (label: string) => {
    switch (label) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Featured':
        return 'bg-gold-100 text-gold-800'
      case 'Best Seller':
        return 'bg-purple-100 text-purple-800'
      case 'Low Stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-charcoal">Products</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg border border-ivory-200">
        <div className="p-4 border-b border-ivory-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-ivory-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory-50 text-charcoal-light">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Image</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-md bg-ivory-200 border border-ivory-300 flex items-center justify-center text-charcoal-light text-xs">
                      Img
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-charcoal">
                    {mockCategories.find((c) => c.id === product.category_id)?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    {product.sale_price ? (
                      <span className="text-red-600">KES {product.sale_price.toLocaleString()}</span>
                    ) : (
                      <span>KES {product.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal">{product.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(statusLabel(product))}`}>
                      {statusLabel(product)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded hover:bg-gold-50 text-gold-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg border border-ivory-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-ivory-200">
                <h3 className="text-lg font-serif text-charcoal">
                  {editing ? 'Edit Product' : 'Add Product'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-ivory-100">
                  <X className="w-5 h-5 text-charcoal-light" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Price (KES)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Sale Price (KES)</label>
                    <input
                      type="number"
                      value={form.sale_price}
                      onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    >
                      <option value="">Select category</option>
                      {mockCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">SKU</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Stock Quantity</label>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-2">Labels</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_new_arrival}
                          onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                          className="w-4 h-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-sm text-charcoal">New Arrival</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_featured}
                          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-sm text-charcoal">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_best_seller}
                          onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
                          className="w-4 h-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-sm text-charcoal">Best Seller</span>
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">Image</label>
                    <div className="border-2 border-dashed border-ivory-300 rounded-md p-6 text-center hover:border-gold-400 transition-colors cursor-pointer">
                      <p className="text-sm text-charcoal-light">Drag and drop an image here, or click to browse</p>
                      <input type="file" accept="image/*" className="hidden" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-ivory-200">
                <button onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
