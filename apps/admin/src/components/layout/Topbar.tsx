'use client'

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
      {/* Left: page title */}
      <h1 className="font-serif text-xl font-bold text-ink">{title}</h1>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="btn-icon relative" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-crimson" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-line-soft" />

        {/* Admin avatar */}
        <div className="w-9 h-9 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center text-crimson font-bold text-sm">
          A
        </div>

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
