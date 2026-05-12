'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl: string
  position: number
  isActive: boolean
  productCount: number
}

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80&h=80&fit=crop&auto=format&q=70', position: 1, isActive: true, productCount: 6 },
  { id: '2', name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=80&h=80&fit=crop&auto=format&q=70', position: 2, isActive: true, productCount: 6 },
  { id: '3', name: 'Home & Living', slug: 'home-living', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop&auto=format&q=70', position: 3, isActive: true, productCount: 5 },
  { id: '4', name: 'Beauty', slug: 'beauty', imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=80&h=80&fit=crop&auto=format&q=70', position: 4, isActive: true, productCount: 6 },
  { id: '5', name: 'Sports', slug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop&auto=format&q=70', position: 5, isActive: true, productCount: 5 },
  { id: '6', name: 'Books', slug: 'books', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=80&fit=crop&auto=format&q=70', position: 6, isActive: true, productCount: 5 },
  { id: '7', name: 'Groceries', slug: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop&auto=format&q=70', position: 7, isActive: true, productCount: 6 },
  { id: '8', name: 'Toys & Kids', slug: 'toys', imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=80&h=80&fit=crop&auto=format&q=70', position: 8, isActive: true, productCount: 5 },
]

const defaultForm = {
  name: '',
  slug: '',
  imageUrl: '',
  position: '',
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [search, setSearch] = useState('')

  const filtered = categories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  )

  function openCreate() {
    setForm(defaultForm)
    setEditTarget(null)
    setShowCreate(true)
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl, position: String(cat.position) })
    setEditTarget(cat)
    setShowCreate(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editTarget) {
      setCategories((cs) =>
        cs.map((c) =>
          c.id === editTarget.id
            ? { ...c, name: form.name, slug: form.slug, imageUrl: form.imageUrl, position: Number(form.position) || c.position }
            : c
        )
      )
    } else {
      const next: Category = {
        id: String(Date.now()),
        name: form.name,
        slug: form.slug || slugify(form.name),
        imageUrl: form.imageUrl || `https://placehold.co/80x80/1a1410/fdfbf7?text=${encodeURIComponent(form.name.slice(0, 2))}`,
        position: Number(form.position) || categories.length + 1,
        isActive: true,
        productCount: 0,
      }
      setCategories((cs) => [...cs, next])
    }
    setShowCreate(false)
    setEditTarget(null)
    setForm(defaultForm)
  }

  function toggleActive(id: string) {
    setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)))
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setCategories((cs) => cs.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const setF = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Categories</h1>
          <p className="text-sm text-ink-3 mt-0.5">Manage product categories shown on the storefront</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Category</button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: categories.length },
          { label: 'Active', value: categories.filter((c) => c.isActive).length },
          { label: 'Total Products', value: categories.reduce((s, c) => s + c.productCount, 0) },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="font-mono text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="input-field pl-9 py-2 text-sm"
        />
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.map((cat) => (
          <div key={cat.id} className={`card p-4 flex flex-col gap-3 ${!cat.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-semibold text-ink truncate">{cat.name}</p>
                  <span className={`badge text-[9px] ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-paper-3 text-ink-3'}`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-ink-3 mt-0.5">{cat.slug}</p>
                <p className="text-xs text-ink-3 mt-1">
                  <span className="font-medium text-ink">{cat.productCount}</span> products · pos {cat.position}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-line-soft">
              <a
                href={`http://localhost:3000/products?category=${cat.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </a>
              <button onClick={() => openEdit(cat)} className="btn-ghost text-xs py-1.5 px-3 flex-1">
                Edit
              </button>
              <button
                onClick={() => toggleActive(cat.id)}
                className={`text-xs py-1.5 px-3 rounded-xl border font-medium transition-colors
                  ${cat.isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
              >
                {cat.isActive ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => cat.productCount === 0 ? setDeleteTarget(cat) : undefined}
                disabled={cat.productCount > 0}
                title={cat.productCount > 0 ? `Cannot delete — ${cat.productCount} products assigned` : 'Delete category'}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-line-soft text-ink-3 hover:border-crimson hover:text-crimson transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-ink-3">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="font-medium">No categories found</p>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-serif text-xl font-bold text-ink mb-5">
              {editTarget ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Category Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => {
                    setF('name', e.target.value)
                    if (!editTarget) setF('slug', slugify(e.target.value))
                  }}
                  placeholder="e.g. Electronics"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setF('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="e.g. electronics"
                  className="input-field font-mono"
                />
                <p className="text-[11px] text-ink-3 mt-1">
                  Will appear at: /products?category=<span className="font-mono">{form.slug || 'slug'}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setF('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field text-sm"
                />
                {form.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-line-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Sort Position</label>
                <input
                  type="number"
                  min="1"
                  value={form.position}
                  onChange={(e) => setF('position', e.target.value)}
                  placeholder="1"
                  className="input-field w-28 font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setEditTarget(null); setForm(defaultForm) }}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editTarget ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink mb-1">Delete "{deleteTarget.name}"?</h3>
            <p className="text-sm text-ink-3 mb-5">This cannot be undone. Make sure no products are assigned first.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={confirmDelete} className="btn-primary flex-1 bg-crimson hover:bg-crimson/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
