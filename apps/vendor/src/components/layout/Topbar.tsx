'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  const router = useRouter()
  const { accessToken, refreshToken, logout } = useAuthStore()

  async function handleLogout() {
    try {
      await api.post('/auth/logout', { refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch { /* proceed even if API call fails */ }
    logout()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-paper/90 backdrop-blur-lg border-b border-line-soft/60 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-ink-3">Vendor Portal</span>
        <span className="text-ink-3">/</span>
        <span className="font-serif text-xl font-bold text-ink">{title}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="btn-icon relative" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-crimson rounded-full border-2 border-paper" />
        </button>

        {/* Go to store */}
        <Link
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs gap-1.5"
        >
          Go to store
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-line-soft" />

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="btn-ghost text-sm text-ink-3 hover:text-crimson flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </header>
  )
}
