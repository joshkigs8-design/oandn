import { useEffect, useState, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

const defaultForm = {
  name: '',
  slug: '',
  image_url: '',
  description: '',
  sort_order: '0',
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(defaultForm)
  const [editing, setEditing] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        alert(error.message)
      }

      if (data) {
        setCategories(data as Category[])
      }
      setIsLoading(false)
    }

    loadCategories()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setForm({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || '',
      description: category.description || '',
      sort_order: String(category.sort_order),
    })
    setSelectedImage(null)
    setPreviewUrl(category.image_url || '')
    setModalOpen(true)
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadCategoryImage = async (file: File, categoryId: string) => {
    const client = supabase
    if (!client) throw new Error('Supabase client not initialized')

    const filePath = `categories/${categoryId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    const { error: uploadError } = await client.storage.from('category-images').upload(filePath, file)
    if (uploadError) throw uploadError

    const { data: urlData } = client.storage.from('category-images').getPublicUrl(filePath)
    return { publicUrl: urlData.publicUrl, storagePath: filePath }
  }

  const handleSave = async () => {
    if (!supabase) return
    setIsSaving(true)

    const payload: {
      name: string
      slug: string
      image_url: string | null
      storage_path?: string | null
      description: string | null
      sort_order: number
    } = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      image_url: form.image_url || null,
      description: form.description || null,
      sort_order: parseInt(form.sort_order) || 0,
    }

    if (editing) {
      if (selectedImage) {
        const { publicUrl, storagePath } = await uploadCategoryImage(selectedImage, editing.id)
        payload.image_url = publicUrl
        payload.storage_path = storagePath
      }

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      if (error) {
        alert(error.message)
      } else if (data) {
        setCategories((prev) => prev.map((item) => (item.id === editing.id ? (data as Category) : item)))
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...payload }])
        .select()
        .single()

      if (error) {
        alert(error.message)
      } else if (data) {
        let createdCategory = data as Category

        if (selectedImage) {
          const { publicUrl, storagePath } = await uploadCategoryImage(selectedImage, createdCategory.id)
          const { data: updateData, error: updateError } = await supabase
            .from('categories')
            .update({ image_url: publicUrl, storage_path: storagePath })
            .eq('id', createdCategory.id)
            .select()
            .single()

          if (updateError) {
            alert(updateError.message)
          } else if (updateData) {
            createdCategory = updateData as Category
          }
        }

        setCategories((prev) => [...prev, createdCategory])
      }
    }

    setModalOpen(false)
    setEditing(null)
    setForm(defaultForm)
    setSelectedImage(null)
    setPreviewUrl('')
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Remove this category and all product associations?')) return

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      setCategories((prev) => prev.filter((category) => category.id !== id))
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
        <h1 className="text-2xl font-serif text-charcoal">Categories</h1>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg border border-ivory-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ivory-50 text-charcoal-light">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Sort</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-ivory-50 transition-colors">
                <td className="px-4 py-3 text-charcoal font-medium">{category.name}</td>
                <td className="px-4 py-3 text-charcoal">{category.slug}</td>
                <td className="px-4 py-3 text-charcoal">{category.sort_order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(category)} className="p-1.5 rounded hover:bg-gold-50 text-gold-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              className="relative bg-white rounded-lg border border-ivory-200 w-full max-w-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-serif text-charcoal">{editing ? 'Edit Category' : 'Add Category'}</h2>
                    <p className="text-sm text-charcoal-light">Manage category metadata for your storefront.</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-md text-charcoal hover:bg-ivory-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <label className="block text-sm text-charcoal">
                    <span>Name</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-2 w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block text-sm text-charcoal">
                    <span>Slug</span>
                    <input
                      value={form.slug}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="auto-generated from name"
                      className="mt-2 w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block text-sm text-charcoal">
                    <span>Category image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="mt-2 w-full text-sm text-charcoal"
                    />
                  </label>
                  <label className="block text-sm text-charcoal">
                    <span>Image URL</span>
                    <input
                      value={form.image_url}
                      onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                      className="mt-2 w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block text-sm text-charcoal">
                    <span>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-2 w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                  <label className="block text-sm text-charcoal">
                    <span>Sort order</span>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                      className="mt-2 w-full rounded-md border border-ivory-300 bg-ivory-50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </label>
                </div>

                {previewUrl ? (
                  <div className="mt-4">
                    <span className="text-sm font-medium text-charcoal">Preview</span>
                    <div className="mt-3 overflow-hidden rounded-lg border border-ivory-300">
                      <img src={previewUrl} alt="Category preview" className="w-full object-cover" />
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary">
                    {isSaving ? 'Saving...' : editing ? 'Save Category' : 'Create Category'}
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
