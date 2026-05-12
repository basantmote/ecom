'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    registrationNumber: '',
    panVat: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [regDoc, setRegDoc] = useState<File | null>(null)
  const [panDoc, setPanDoc] = useState<File | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1800))
    setLoading(false)
  }

  const darkInput =
    'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white ' +
    'placeholder:text-ink-3 focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/25 transition-all duration-200'

  const darkLabel = 'block text-xs font-medium text-ink-3 uppercase tracking-wider mb-1.5'

  const sectionHeading = (num: string, title: string) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-crimson flex items-center justify-center text-white text-xs font-bold shrink-0">
        {num}
      </div>
      <h3 className="text-paper font-semibold text-base">{title}</h3>
    </div>
  )

  return (
    <div className="min-h-screen bg-mesh-dark flex items-center justify-center p-4 py-10">
      <div className="glass-dark rounded-3xl p-10 w-full max-w-2xl border border-white/15 shadow-float animate-fade-up">
        {/* Logo */}
        <div className="mb-6">
          <div className="font-serif text-2xl font-bold text-paper">
            हाम्रो<span className="text-gradient-crimson">Bazaar</span>
          </div>
          <div className="text-ink-3 text-xs tracking-widest uppercase mt-1">Vendor Portal</div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-crimson" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <span className="text-ink-3 text-xs">Step 1 of 2</span>
        </div>

        <h1 className="font-serif text-3xl font-bold text-white mb-1">Register Your Store</h1>
        <p className="text-ink-3 text-sm mb-8">Fill in the details below to apply as a vendor.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Info */}
          <div>
            {sectionHeading('1', 'Business Information')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={darkLabel}>Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={set('businessName')}
                  placeholder="e.g. TechHub Nepal Pvt. Ltd."
                  required
                  className={darkInput}
                />
              </div>
              <div>
                <label className={darkLabel}>Business Category</label>
                <select
                  value={form.category}
                  onChange={set('category')}
                  required
                  className={darkInput + ' appearance-none'}
                >
                  <option value="" className="bg-ink text-white">Select category…</option>
                  {['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Food & Grocery', 'Other'].map(
                    (c) => (
                      <option key={c} value={c} className="bg-ink text-white">
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className={darkLabel}>Business Registration Number</label>
                <input
                  type="text"
                  value={form.registrationNumber}
                  onChange={set('registrationNumber')}
                  placeholder="e.g. 123456/078/079"
                  className={darkInput}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={darkLabel}>PAN / VAT Number</label>
                <input
                  type="text"
                  value={form.panVat}
                  onChange={set('panVat')}
                  placeholder="e.g. 600123456"
                  className={darkInput}
                />
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div>
            {sectionHeading('2', 'Owner Information')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={darkLabel}>Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="Ramesh Shrestha"
                  required
                  className={darkInput}
                />
              </div>
              <div>
                <label className={darkLabel}>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  required
                  className={darkInput}
                />
              </div>
              <div>
                <label className={darkLabel}>Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+977 98XXXXXXXX"
                  required
                  className={darkInput}
                />
              </div>
              <div>
                <label className={darkLabel}>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  required
                  className={darkInput}
                />
              </div>
              <div>
                <label className={darkLabel}>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="••••••••"
                  required
                  className={darkInput}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            {sectionHeading('3', 'Documents')}
            <div className="space-y-4">
              {/* Registration Doc */}
              <div>
                <label className={darkLabel}>Business Registration Document</label>
                <label className="flex items-center gap-3 w-full cursor-pointer bg-white/5 border border-white/15 border-dashed rounded-xl px-4 py-3 hover:border-crimson/50 hover:bg-white/8 transition-all duration-200">
                  <svg className="w-5 h-5 text-ink-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-ink-3 flex-1">
                    {regDoc ? regDoc.name : 'Upload Business Registration Doc (PDF / JPG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setRegDoc(e.target.files?.[0] ?? null)}
                  />
                  <span className="shrink-0 text-xs text-white/60 bg-white/10 px-3 py-1 rounded-lg">
                    Browse
                  </span>
                </label>
              </div>

              {/* PAN Card */}
              <div>
                <label className={darkLabel}>PAN Card</label>
                <label className="flex items-center gap-3 w-full cursor-pointer bg-white/5 border border-white/15 border-dashed rounded-xl px-4 py-3 hover:border-crimson/50 hover:bg-white/8 transition-all duration-200">
                  <svg className="w-5 h-5 text-ink-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-ink-3 flex-1">
                    {panDoc ? panDoc.name : 'Upload PAN Card (PDF / JPG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setPanDoc(e.target.files?.[0] ?? null)}
                  />
                  <span className="shrink-0 text-xs text-white/60 bg-white/10 px-3 py-1 rounded-lg">
                    Browse
                  </span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              'Submit Application →'
            )}
          </button>

          <p className="text-ink-3 text-xs mt-6 text-center">
            Your application will be reviewed within 24 hours. You&apos;ll receive an SMS confirmation.
          </p>
        </form>

        <p className="text-center text-sm text-ink-3 mt-6">
          Already registered?{' '}
          <Link href="/login" className="text-crimson hover:text-crimson-deep font-medium transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
