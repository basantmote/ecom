'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { api } from '@/lib/api'

export function Navbar() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const itemCount = useCartStore((s) => s.itemCount())
  const { userId, accessToken, refreshToken, logout } = useAuthStore()
  const wishlistCount = useWishlistStore((s) => s.productIds.length)
  const clearWishlist = useWishlistStore((s) => s.clear)

  useEffect(() => { setMounted(true) }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    setUserMenuOpen(false)
    try {
      await api.post('/auth/logout', { refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch { /* proceed even if API call fails */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    logout()
    clearWishlist()
    router.push('/')
  }

  const isLoggedIn = mounted && !!userId

  return (
    <header className="sticky top-0 z-50 glass border-b border-line-soft/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <span className="font-serif text-[22px] font-bold leading-none">
            <span className="text-ink group-hover:text-ink-2 transition-colors">हाम्रो</span>
            <span className="text-gradient-crimson">Bazaar</span>
          </span>
        </Link>

        {/* Search */}
        <form
          className="flex-1 max-w-2xl relative"
          onSubmit={(e) => {
            e.preventDefault()
            if (search.trim()) window.location.href = `/products?q=${encodeURIComponent(search)}`
          }}
        >
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands, vendors…"
            className="input-field pl-10 pr-4 h-10 text-sm"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* User menu (logged in) or Sign in button */}
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="btn-ghost text-sm gap-1.5 hidden sm:inline-flex"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
                <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mobile account icon */}
              <button onClick={() => setUserMenuOpen((o) => !o)} className="btn-icon sm:hidden">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-paper rounded-xl shadow-float border border-line-soft py-1 z-50">
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-paper-2 transition-colors"
                  >
                    <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-paper-2 transition-colors"
                  >
                    <svg className="w-4 h-4 text-ink-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </Link>
                  <div className="border-t border-line-soft my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-crimson hover:bg-crimson/5 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-secondary hidden sm:inline-flex text-sm py-2 px-4">
              Sign in
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href={isLoggedIn ? '/account?tab=wishlist' : '/login'}
            className="btn-icon relative ml-1"
            aria-label="Wishlist"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-crimson text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="btn-icon relative ml-1" aria-label="Cart">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-crimson text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

        </div>
      </div>

      {/* Category strip */}
      <div className="border-t border-line-soft/50">
        <nav className="max-w-7xl mx-auto px-4 flex items-center h-9 overflow-x-auto scrollbar-none gap-0.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 px-3 py-1 text-xs font-medium text-ink-3 hover:text-crimson hover:bg-crimson/5 rounded-lg transition-colors whitespace-nowrap"
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

const CATEGORIES = [
  { slug: 'electronics', label: 'Electronics', icon: '📱' },
  { slug: 'fashion', label: 'Fashion', icon: '👗' },
  { slug: 'home-living', label: 'Home & Living', icon: '🏠' },
  { slug: 'beauty', label: 'Beauty', icon: '💄' },
  { slug: 'sports', label: 'Sports', icon: '⚽' },
  { slug: 'books', label: 'Books', icon: '📚' },
  { slug: 'groceries', label: 'Groceries', icon: '🛒' },
  { slug: 'toys', label: 'Toys', icon: '🧸' },
  { slug: 'health', label: 'Health', icon: '💊' },
  { slug: 'automotive', label: 'Automotive', icon: '🚗' },
]
