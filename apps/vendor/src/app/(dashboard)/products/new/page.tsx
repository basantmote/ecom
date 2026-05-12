'use client'

import { useState } from 'react'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Food & Grocery', 'Accessories', 'Other']

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    comparePrice: '',
    costPerItem: '',
    sku: '',
    stock: '',
    lowStockThreshold: '',
    hasVariants: false,
  })

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const priceDisplay = form.price
    ? 'Rs. ' + Number(form.price).toLocaleString('en-IN')
    : 'Rs. —'

  return (
    <div className="animate-fade-up max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <a href="/products" className="btn-icon">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Add New Product</h2>
          <p className="text-ink-3 text-sm mt-0.5">Fill in the details to list your product</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form — left 2 cols */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center font-bold">1</span>
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Product Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Samsung Galaxy A55 5G"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Describe your product features, specifications…"
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                    Category <span className="text-crimson">*</span>
                  </label>
                  <select value={form.category} onChange={set('category')} className="input-field appearance-none">
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">Brand</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={set('brand')}
                    placeholder="e.g. Samsung"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center font-bold">2</span>
              Pricing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Price (Rs.) <span className="text-crimson">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">Rs.</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={set('price')}
                    placeholder="0"
                    min="0"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">Rs.</span>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={set('comparePrice')}
                    placeholder="0"
                    min="0"
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Cost per Item
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3 font-medium">Rs.</span>
                  <input
                    type="number"
                    value={form.costPerItem}
                    onChange={set('costPerItem')}
                    placeholder="0"
                    min="0"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
            {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                Discount: {Math.round((1 - Number(form.price) / Number(form.comparePrice)) * 100)}% off
              </p>
            )}
          </div>

          {/* Inventory */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center font-bold">3</span>
              Inventory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={set('sku')}
                  placeholder="e.g. SAM-A55-BLK"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Stock Quantity <span className="text-crimson">*</span>
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={set('stock')}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={set('lowStockThreshold')}
                  placeholder="e.g. 5"
                  min="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center font-bold">4</span>
              Variants
            </h3>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setForm((prev) => ({ ...prev, hasVariants: !prev.hasVariants }))}
                className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                  form.hasVariants ? 'bg-crimson' : 'bg-line-soft'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.hasVariants ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm text-ink-2">This product has variants (sizes, colors)</span>
            </label>
            {form.hasVariants && (
              <div className="mt-4 p-4 bg-paper-2 rounded-xl border border-line-soft text-sm text-ink-3">
                Variant management (size, color options) will be available after saving the product.
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card p-6">
            <h3 className="font-semibold text-ink text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs flex items-center justify-center font-bold">5</span>
              Product Images
            </h3>
            <div className="border-2 border-dashed border-line-soft rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-crimson/40 hover:bg-paper-2/50 transition-all duration-200 cursor-pointer group">
              <svg className="w-10 h-10 text-ink-3 group-hover:text-crimson transition-colors duration-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-ink-2">Drag images here or click to upload</p>
              <p className="text-xs text-ink-3 mt-1">PNG, JPG, WEBP up to 5MB each. First image is the cover.</p>
              <input type="file" accept="image/*" multiple className="hidden" />
            </div>
          </div>
        </div>

        {/* Preview — right col */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 space-y-4">
            <h3 className="font-semibold text-ink text-sm">Live Preview</h3>
            {/* Mock product card */}
            <div className="card p-4 max-w-xs">
              <div className="aspect-square bg-paper-2 rounded-xl mb-3 flex items-center justify-center text-5xl">
                {form.category === 'Electronics' ? '📱'
                  : form.category === 'Fashion' ? '👗'
                  : form.category === 'Home & Living' ? '🏠'
                  : form.category === 'Beauty' ? '💄'
                  : form.category === 'Sports' ? '⚽'
                  : form.category === 'Food & Grocery' ? '🛒'
                  : '📦'}
              </div>
              <div>
                <p className="text-xs text-ink-3 mb-1">
                  {form.brand || 'Brand'} · {form.category || 'Category'}
                </p>
                <h4 className="font-semibold text-sm text-ink leading-snug mb-2 min-h-[2.5rem]">
                  {form.name || 'Product name will appear here'}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-crimson font-bold text-base">{priceDisplay}</span>
                  {form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
                    <span className="font-mono text-ink-3 text-xs line-through">
                      Rs. {Number(form.comparePrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {form.stock && (
                  <p className="text-xs text-ink-3 mt-1">{form.stock} in stock</p>
                )}
              </div>
            </div>

            {/* Margin helper */}
            {form.price && form.costPerItem && (
              <div className="card p-4">
                <p className="text-xs text-ink-3 uppercase tracking-wide font-medium mb-2">Margin</p>
                <p className="font-mono text-lg font-bold text-green-600">
                  Rs. {(Number(form.price) - Number(form.costPerItem)).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-ink-3">
                  {Math.round((1 - Number(form.costPerItem) / Number(form.price)) * 100)}% profit margin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-line-soft">
        <button className="btn-ghost">Save as Draft</button>
        <button className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Publish Product
        </button>
      </div>
    </div>
  )
}
