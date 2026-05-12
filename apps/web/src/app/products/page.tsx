'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Suspense, useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/home/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton'
import { Spinner } from '@/components/ui/Spinner'

const PAGE_SIZE = 20

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  fashion: 'Fashion',
  'home-living': 'Home & Living',
  beauty: 'Beauty',
  sports: 'Sports',
  books: 'Books',
  groceries: 'Groceries',
  toys: 'Toys & Kids',
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  electronics: 'Smartphones, laptops, audio, and more — genuine products with warranty.',
  fashion: 'Clothing, footwear, ethnic wear, and accessories for every style.',
  'home-living': 'Appliances, kitchenware, and décor for your Nepali home.',
  beauty: 'Skincare, makeup, and personal care from trusted brands.',
  sports: 'Fitness gear, sports equipment, and nutrition supplements.',
  books: 'Bestsellers, textbooks, and Nepali literature.',
  groceries: 'Daily staples, organic produce, and pantry essentials.',
  toys: 'Educational toys, games, and gifts for children of all ages.',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

interface ProductVariant {
  id: string
  price: number
  comparePrice: number | null
  stock: number
  reservedStock: number
  images: string[]
}

interface Product {
  id: string
  vendorId: string
  name: string
  slug: string
  variants: ProductVariant[]
  vendor: { storeName: string }
}

interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

function formatCardProps(p: Product): React.ComponentProps<typeof ProductCard> {
  const variant = p.variants[0]
  const availableStock = (variant?.stock ?? 0) - (variant?.reservedStock ?? 0)
  return {
    slug: p.slug,
    name: p.name,
    vendorName: p.vendor.storeName,
    vendorId: p.vendorId,
    productId: p.id,
    variantId: variant?.id,
    price: variant?.price ?? 0,
    originalPrice: variant?.comparePrice ?? undefined,
    imageUrl: variant?.images?.[0] ?? 'https://placehold.co/400x400/ebe5d6/4a4239?text=Product',
    outOfStock: availableStock <= 0,
  }
}

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
  const { page, totalPages } = meta
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i)
    }
  }

  const withGaps: (number | -1)[] = []
  let prev = 0
  for (const p of pages) {
    if (p - prev > 1) withGaps.push(-1)
    withGaps.push(p)
    prev = p
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-10">
      <p className="text-xs text-ink-3">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-line-soft text-ink-2 hover:bg-paper-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
        >
          ‹
        </button>
        {withGaps.map((p, i) =>
          p === -1 ? (
            <span key={`gap-${i}`} className="w-9 h-9 flex items-center justify-center text-ink-3 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-ink text-paper'
                  : 'border border-line-soft text-ink-2 hover:bg-paper-2'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-line-soft text-ink-2 hover:bg-paper-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
        >
          ›
        </button>
      </div>
    </div>
  )
}

function ProductsContent() {
  const router = useRouter()
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const page = Math.max(1, Number(params.get('page') ?? 1))

  const [searchInput, setSearchInput] = useState(q)
  const latestParams = useRef(params)
  const latestQ = useRef(q)
  useEffect(() => { latestParams.current = params; latestQ.current = q }, [params, q])

  // Sync input when URL q changes (e.g., browser back/forward)
  useEffect(() => { setSearchInput(q) }, [q])

  // Debounced URL push when user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput === latestQ.current) return
      const next = new URLSearchParams(latestParams.current.toString())
      if (searchInput) next.set('q', searchInput)
      else next.delete('q')
      next.delete('page')
      router.push(`/products?${next.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, router])

  function setParam(key: string, value: string, resetPage = false) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    if (resetPage) next.delete('page')
    router.push(`/products?${next.toString()}`)
  }

  function setPage(p: number) {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(p))
    router.push(`/products?${next.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const serverSort = sort === 'price_asc' || sort === 'price_desc' ? 'newest' : sort

  const { data: result, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', q, category, sort, page],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          search: q || undefined,
          category: category || undefined,
          sort: serverSort !== 'newest' ? serverSort : undefined,
          page,
          limit: PAGE_SIZE,
        },
      })
      let products = res.data.data as Product[]
      // Client-side price sort (sorts within current page)
      if (sort === 'price_asc') {
        products = [...products].sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0))
      } else if (sort === 'price_desc') {
        products = [...products].sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0))
      }
      return { data: products, meta: res.data.meta as Meta }
    },
  })

  const products = result?.data ?? []
  const meta = result?.meta

  const categoryLabel = category ? (CATEGORY_LABELS[category] ?? category) : null
  const categoryDesc = category ? CATEGORY_DESCRIPTIONS[category] : null

  const rangeStart = meta ? (page - 1) * PAGE_SIZE + 1 : 0
  const rangeEnd = meta ? Math.min(page * PAGE_SIZE, meta.total) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        {q ? (
          <>
            <p className="text-xs text-ink-3 mb-0.5">Search results for</p>
            <h1 className="font-serif text-2xl font-bold text-ink">"{q}"</h1>
          </>
        ) : categoryLabel ? (
          <>
            <div className="flex items-center gap-1.5 text-xs text-ink-3 mb-0.5">
              <button onClick={() => router.push('/products')} className="hover:text-ink transition-colors">
                All Products
              </button>
              <span>›</span>
              <span>{categoryLabel}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink">{categoryLabel}</h1>
            {categoryDesc && <p className="text-sm text-ink-3 mt-1">{categoryDesc}</p>}
          </>
        ) : (
          <h1 className="font-serif text-2xl font-bold text-ink">All Products</h1>
        )}
      </div>

      {/* Search bar + Sort */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const next = new URLSearchParams(params.toString())
                if (searchInput) next.set('q', searchInput)
                else next.delete('q')
                next.delete('page')
                router.push(`/products?${next.toString()}`)
              }
            }}
            placeholder="Search products, brands…"
            className="input-field pl-9 pr-9 py-2.5 text-sm w-full"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setParam('sort', e.target.value, true)}
          className="input-field py-2.5 text-sm min-w-[170px] cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
        <button
          onClick={() => setParam('category', '', true)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !category ? 'bg-ink text-paper border-ink' : 'border-line-soft text-ink-3 hover:border-ink-3 hover:text-ink'
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
          <button
            key={slug}
            onClick={() => setParam('category', category === slug ? '' : slug, true)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === slug ? 'bg-ink text-paper border-ink' : 'border-line-soft text-ink-3 hover:border-ink-3 hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {meta && !isLoading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-ink-3">
            {meta.total === 0
              ? 'No products found'
              : `Showing ${rangeStart}–${rangeEnd} of ${meta.total} product${meta.total !== 1 ? 's' : ''}`}
          </p>
          {isFetching && !isLoading && (
            <span className="text-xs text-ink-3 flex items-center gap-1.5">
              <Spinner className="w-3 h-3" /> Updating…
            </span>
          )}
        </div>
      )}

      {/* Product grid / states */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-24 text-ink-3">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-lg font-medium text-ink">Failed to load products</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-ink-3">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium text-ink">No products found</p>
          {q && <p className="text-sm mt-2">Try different keywords or remove some filters.</p>}
          {!q && category && <p className="text-sm mt-2">No products listed in this category yet.</p>}
          {(q || category) && (
            <button
              onClick={() => router.push('/products')}
              className="mt-5 px-5 py-2 rounded-xl border border-line-soft text-sm text-ink-2 hover:bg-paper-2 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...formatCardProps(p)} />
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner className="w-8 h-8" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
