import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category, Product, ProductImage } from '@/types'

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
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) return
      setIsLoading(true)

      const [categoriesRes, productsRes, imagesRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('product_images').select('*'),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data as Category[])

      const images = imagesRes.data ? (imagesRes.data as ProductImage[]) : []

      if (productsRes.data) {
        const productsWithImages = (productsRes.data as Product[]).map((product) => ({
          ...product,
          images: images.filter((image) => image.product_id === product.id).sort((a, b) => a.sort_order - b.sort_order),
        }))
        setProducts(productsWithImages)
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    )
  }, [products, search])

  useEffect(() => {
    const urls = selectedImages.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)

    return () => {
      urls.forEach(URL.revokeObjectURL)
    }
  }, [selectedImages])

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setSelectedImages([])
    setPreviewUrls([])
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
    setSelectedImages([])
    setPreviewUrls([])
    setModalOpen(true)
  }

  const handleImageFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setSelectedImages((prev) => [...prev, ...Array.from(files)])
  }

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const uploadProductImage = async (file: File, productId: string) => {
    const client = supabase
    if (!client) throw new Error('Supabase client not initialized')

    const filePath = `products/${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`

    const { error: uploadError } = await client.storage.from('product-images').upload(filePath, file)
    if (uploadError) throw uploadError

    const { data: urlData } = client.storage.from('product-images').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    const { data: imageData, error: insertError } = await client
      .from('product_images')
      .insert([
        {
          product_id: productId,
          image_url: publicUrl,
          alt_text: file.name,
          storage_path: filePath,
          sort_order: 0,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError
    return imageData as ProductImage
  }

  const handleDeleteImage = async (image: ProductImage) => {
    const client = supabase
    if (!client) return
    if (!confirm('Delete this image from the product?')) return

    const { error } = await client.from('product_images').delete().eq('id', image.id)
    if (error) {
      alert(error.message)
      return
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === image.product_id
          ? { ...product, images: product.images?.filter((item) => item.id !== image.id) ?? [] }
          : product
      )
    )

    if (image.storage_path) {
      await client.storage.from('product-images').remove([image.storage_path])
    }
  }

  const handleSave = async () => {
    if (!supabase) return
    setIsSaving(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: form.category_id || null,
      sku: form.sku || null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_new_arrival: form.is_new_arrival,
      is_featured: form.is_featured,
      is_best_seller: form.is_best_seller,
    }

    let savedProduct: Product | null = null
    let existingImages: ProductImage[] = editing?.images ?? []

    const client = supabase
    if (!client) {
      alert('Supabase client not initialized')
    } else if (editing) {
      const { error, data } = await client
        .from('products')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      if (error) {
        alert(error.message)
      } else if (data) {
        savedProduct = data as Product
      }
    } else {
      const { error, data } = await client
        .from('products')
        .insert([{ ...payload, slug: form.name.toLowerCase().replace(/\s+/g, '-') }])
        .select()
        .single()

      if (error) {
        alert(error.message)
      } else if (data) {
        savedProduct = data as Product
      }
    }

    if (savedProduct) {
      const uploadedImages = await Promise.all(
        selectedImages.map((file) => uploadProductImage(file, savedProduct!.id))
      )

      const productWithImages: Product = {
        ...savedProduct,
        images: [...existingImages, ...uploadedImages],
      }

      if (editing) {
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? productWithImages : p)))
      } else {
        setProducts((prev) => [productWithImages, ...prev])
      }

      if (uploadedImages.length > 0) {
        // Images are already stored in product records via the upload flow.
      }
    }

    setIsSaving(false)
    setModalOpen(false)
    setEditing(null)
    setForm(defaultForm)
    setSelectedImages([])
    setPreviewUrls([])
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
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

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
                    {product.images?.[0]?.image_url ? (
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded-md object-cover border border-ivory-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-ivory-200 border border-ivory-300 flex items-center justify-center text-charcoal-light text-xs">
                        Img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-charcoal">
                    {categories.find((c) => c.id === product.category_id)?.name || '—'}
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
              className="relative bg-white rounded-lg border border-ivory-200 w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-serif text-charcoal">{editing ? 'Edit Product' : 'Add Product'}</h2>
                    <p className="text-sm text-charcoal-light">Manage the product details and visibility.</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-md text-charcoal hover:bg-ivory-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>Name</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>SKU</span>
                    <input
                      value={form.sku}
                      onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal md:col-span-2">
                    <span>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>Price</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>Sale Price</span>
                    <input
                      type="number"
                      value={form.sale_price}
                      onChange={(e) => setForm((prev) => ({ ...prev, sale_price: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>Category</span>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-2 text-sm text-charcoal">
                    <span>Stock Quantity</span>
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) => setForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                      className="w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={form.is_new_arrival}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_new_arrival: e.target.checked }))}
                      className="h-4 w-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                    />
                    New Arrival
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                    />
                    Featured
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={form.is_best_seller}
                      onChange={(e) => setForm((prev) => ({ ...prev, is_best_seller: e.target.checked }))}
                      className="h-4 w-4 rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                    />
                    Best Seller
                  </label>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-charcoal">Product Photos</h3>
                  <p className="text-xs text-charcoal-light mb-3">Upload product images to the Supabase storage bucket and attach them to this product.</p>
                  <label className="block text-sm text-charcoal">
                    <span>Choose files</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFilesChange}
                      className="mt-2 w-full text-sm text-charcoal"
                    />
                  </label>

                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {previewUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative rounded-lg overflow-hidden border border-ivory-300">
                          <img src={url} alt={`Selected ${index + 1}`} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedImage(index)}
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {editing?.images?.length ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-charcoal">Existing images</h4>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {editing.images.map((image) => (
                          <div key={image.id} className="relative rounded-lg overflow-hidden border border-ivory-300">
                            <img src={image.image_url} alt={image.alt_text || form.name} className="h-24 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image)}
                              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary"
                    type="button"
                  >
                    {isSaving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
