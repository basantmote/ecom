'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        fullName: form.fullName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
      })
      const { accessToken, refreshToken } = data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setTokens(accessToken, refreshToken, payload.sub, payload.role)
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Create account</h1>
        <p className="text-ink-3 text-sm mb-8">
          Already have one?{' '}
          <Link href="/login" className="text-crimson hover:underline">
            Sign in
          </Link>
        </p>

        {error && (
          <p className="bg-red-50 border border-crimson/20 text-crimson text-sm px-3 py-2 rounded-md mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="98XXXXXXXX"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <p className="text-xs text-ink-3 -mt-2">At least one of email or phone is required.</p>
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create account
          </Button>
        </form>
      </div>
    </div>
  )
}
