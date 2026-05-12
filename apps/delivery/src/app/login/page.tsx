'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', {
        phone: `+977${phone.replace(/^0+/, '')}`,
        password,
      })
      const { accessToken, refreshToken } = data.data
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      if (payload.role !== 'DELIVERY') {
        setError('Access denied. Delivery partner accounts only.')
        setLoading(false)
        return
      }
      localStorage.setItem('delivery-accessToken', accessToken)
      localStorage.setItem('delivery-refreshToken', refreshToken)
      setTokens(accessToken, refreshToken, payload.sub, payload.role)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid phone or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-mesh-dark flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <div className="text-5xl mb-4 animate-float">🛵</div>
        <h1 className="font-serif text-3xl font-bold text-white">
          हाम्रो
          <span className="bg-gradient-to-r from-crimson to-gold bg-clip-text text-transparent">
            Bazaar
          </span>
        </h1>
        <p className="text-white/50 text-sm tracking-widest uppercase mt-1">
          Delivery Partner
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card-dark p-6 mt-8">
        <h2 className="text-white text-xl font-bold mb-1">Sign In</h2>
        <p className="text-white/50 text-sm mb-6">Welcome back, partner</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Phone */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">
              Phone Number
            </label>
            <div className="flex items-center gap-0 rounded-2xl overflow-hidden border border-white/15 focus-within:border-crimson focus-within:ring-2 focus-within:ring-crimson/20 transition-all duration-200">
              <div className="bg-white/10 px-4 py-4 text-white/70 text-base font-medium border-r border-white/15 shrink-0">
                +977
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="flex-1 bg-white/5 px-4 py-4 text-white placeholder:text-white/35 text-base focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-dark pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1 text-base py-4"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </>
            ) : (
              'Continue →'
            )}
          </button>
        </form>

        <p className="text-white/40 text-xs text-center mt-4">
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </main>
  )
}
