'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      if (payload.role !== 'VENDOR') {
        setError('Access denied. Vendor accounts only.')
        return
      }
      setTokens(accessToken, refreshToken, payload.sub, payload.role)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh-dark flex items-center justify-center p-4">
      <div className="glass-dark rounded-3xl p-10 w-full max-w-md border border-white/15 shadow-float animate-fade-up">
        {/* Logo */}
        <div className="mb-8">
          <div className="font-serif text-2xl font-bold text-paper">
            हाम्रो<span className="text-gradient-crimson">Bazaar</span>
          </div>
          <div className="text-ink-3 text-xs tracking-widest uppercase mt-1">Vendor Portal</div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-white mb-2">Vendor Login</h1>
        <p className="text-ink-3 text-sm mb-8">Sign in to manage your store and products.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white
                         placeholder:text-ink-3 focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/25
                         transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 pr-11 text-sm text-white
                           placeholder:text-ink-3 focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/25
                           transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-white transition-colors"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-3 mt-8">
          New vendor?{' '}
          <Link href="/register" className="text-crimson hover:text-crimson-deep font-medium transition-colors">
            Register your store →
          </Link>
        </p>
      </div>
    </div>
  )
}
