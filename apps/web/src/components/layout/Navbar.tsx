'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'

export function Navbar() {
  const [search, setSearch] = useState('')
  const itemCount = useCartStore((s) => s.itemCount())
  const userId = useAuthStore((s) => s.userId)

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-line-soft">
      {/* Main nav row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-serif text-xl font-bold text-ink">
            हाम्रो<span className="text-crimson">Bazaar</span>
          </span>
        </Link>

        {/* Search */}
        <form
          className="flex-1 max-w-xl relative"
          onSubmit={(e) => {
            e.preventDefault()
            if (search.trim()) window.location.href = `/products?q=${encodeURIComponent(search)}`
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, vendors..."
            className="input-field pr-10"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            aria-label="Search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {userId ? (
            <Link href="/account" className="btn-ghost text-sm hidden sm:inline-flex">
              My Account
            </Link>
          ) : (
            <Link href="/login" className="btn-secondary text-sm hidden sm:inline-flex">
              Sign in
            </Link>
          )}

          <Link href="/cart" className="relative p-2 rounded-md hover:bg-paper-2 transition-colors">
            <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-crimson text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category strip */}
      <nav className="border-t border-line-soft bg-paper-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 px-3 py-1 text-sm text-ink-2 hover:text-crimson hover:bg-paper-3 rounded transition-colors whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

const CATEGORIES = [
  { slug: 'electronics', label: 'Electronics' },
  { slug: 'fashion', label: 'Fashion' },
  { slug: 'home-living', label: 'Home & Living' },
  { slug: 'beauty', label: 'Beauty' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'books', label: 'Books' },
  { slug: 'groceries', label: 'Groceries' },
  { slug: 'toys', label: 'Toys & Kids' },
  { slug: 'automotive', label: 'Automotive' },
  { slug: 'health', label: 'Health' },
]
