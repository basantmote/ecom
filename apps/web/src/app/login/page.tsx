'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [tab, setTab] = useState<'email' | 'otp'>('email')
  const [form, setForm] = useState({ email: '', phone: '', password: '', code: '' })
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setError('')
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password })
      const { accessToken, refreshToken } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      // Decode userId/role from JWT payload
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setTokens(accessToken, refreshToken, payload.sub, payload.role)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { phone: form.phone })
      setStep('otp')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify-login', { phone: form.phone, code: form.code })
      const { accessToken, refreshToken } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setTokens(accessToken, refreshToken, payload.sub, payload.role)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Sign in</h1>
        <p className="text-ink-3 text-sm mb-8">
          New here?{' '}
          <Link href="/register" className="text-crimson hover:underline">
            Create an account
          </Link>
        </p>

        {/* Tab switcher */}
        <div className="flex border border-line-soft rounded-md overflow-hidden mb-6">
          {(['email', 'otp'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setStep('input'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'
              }`}
            >
              {t === 'email' ? 'Email & Password' : 'Phone OTP'}
            </button>
          ))}
        </div>

        {error && (
          <p className="bg-red-50 border border-crimson/20 text-crimson text-sm px-3 py-2 rounded-md mb-4">
            {error}
          </p>
        )}

        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        )}

        {tab === 'otp' && step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Phone number"
              type="tel"
              required
              placeholder="98XXXXXXXX"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send OTP
            </Button>
          </form>
        )}

        {tab === 'otp' && step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-ink-2">OTP sent to <strong>{form.phone}</strong></p>
            <Input
              label="6-digit OTP"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Verify & Sign in
            </Button>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-sm text-ink-3 hover:text-ink w-full text-center"
            >
              &larr; Change number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
