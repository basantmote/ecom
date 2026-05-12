'use client'

import { useState } from 'react'

type CouponType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'

interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderAmount: number
  maxDiscountAmount: number | null
  maxUses: number | null
  usedCount: number
  perUserLimit: number | null
  validFrom: string
  validUntil: string
  isActive: boolean
}

const DEMO_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderAmount: 0, maxDiscountAmount: 100000, maxUses: 500, usedCount: 47, perUserLimit: 1, validFrom: '2026-05-01', validUntil: '2026-12-31', isActive: true },
  { id: '2', code: 'SAVE500', type: 'FIXED', value: 50000, minOrderAmount: 200000, maxDiscountAmount: null, maxUses: 200, usedCount: 32, perUserLimit: null, validFrom: '2026-05-01', validUntil: '2026-12-31', isActive: true },
  { id: '3', code: 'FREESHIP', type: 'FREE_SHIPPING', value: 0, minOrderAmount: 50000, maxDiscountAmount: null, maxUses: null, usedCount: 89, perUserLimit: null, validFrom: '2026-05-01', validUntil: '2026-12-31', isActive: true },
  { id: '4', code: 'FLASH25', type: 'PERCENTAGE', value: 25, minOrderAmount: 100000, maxDiscountAmount: 100000, maxUses: 100, usedCount: 61, perUserLimit: 1, validFrom: '2026-05-01', validUntil: '2026-08-31', isActive: true },
  { id: '5', code: 'TECHSALE15', type: 'PERCENTAGE', value: 15, minOrderAmount: 500000, maxDiscountAmount: 200000, maxUses: 50, usedCount: 12, perUserLimit: 2, validFrom: '2026-05-01', validUntil: '2026-08-31', isActive: true },
  { id: '6', code: 'DASHAIN200', type: 'FIXED', value: 20000, minOrderAmount: 100000, maxDiscountAmount: null, maxUses: 300, usedCount: 5, perUserLimit: 1, validFrom: '2026-05-01', validUntil: '2026-10-31', isActive: true },
  { id: '7', code: 'EXPIRED50', type: 'PERCENTAGE', value: 50, minOrderAmount: 0, maxDiscountAmount: null, maxUses: 10, usedCount: 10, perUserLimit: null, validFrom: '2025-01-01', validUntil: '2025-12-31', isActive: false },
]

const TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: '% Off',
  FIXED: 'Fixed',
  FREE_SHIPPING: 'Free Ship',
}
const TYPE_COLORS: Record<CouponType, string> = {
  PERCENTAGE: 'bg-crimson/10 text-crimson',
  FIXED: 'bg-gold/15 text-amber-700',
  FREE_SHIPPING: 'bg-blue-100 text-blue-700',
}

function formatValue(c: Coupon) {
  if (c.type === 'PERCENTAGE') return `${c.value}%`
  if (c.type === 'FIXED') return `Rs. ${(c.value / 100).toLocaleString('en-IN')}`
  return 'Free Shipping'
}

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-IN')}`
}

function isExpired(validUntil: string) {
  return new Date(validUntil) < new Date()
}

const defaultForm = {
  code: '',
  type: 'PERCENTAGE' as CouponType,
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  maxUses: '',
  perUserLimit: '',
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: '2026-12-31',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(DEMO_COUPONS)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = coupons.filter((c) => {
    if (filter === 'active') return c.isActive && !isExpired(c.validUntil)
    if (filter === 'expired') return !c.isActive || isExpired(c.validUntil)
    return true
  })

  function toggleActive(id: string) {
    setCoupons((cs) => cs.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)))
  }

  function deleteCoupon(id: string) {
    setCoupons((cs) => cs.filter((c) => c.id !== id))
    setDeleteId(null)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const newCoupon: Coupon = {
      id: String(Date.now()),
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: form.type === 'FIXED'
        ? Math.round(parseFloat(form.value || '0') * 100)
        : parseFloat(form.value || '0'),
      minOrderAmount: Math.round(parseFloat(form.minOrderAmount || '0') * 100),
      maxDiscountAmount: form.maxDiscountAmount
        ? Math.round(parseFloat(form.maxDiscountAmount) * 100)
        : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit) : null,
      validFrom: form.validFrom,
      validUntil: form.validUntil,
      isActive: true,
      usedCount: 0,
    }
    setCoupons((cs) => [newCoupon, ...cs])
    setShowCreate(false)
    setForm(defaultForm)
  }

  const setF = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Coupons</h1>
          <p className="text-sm text-ink-3 mt-0.5">Create and manage platform-wide promo codes</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Create Coupon</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Coupons', value: coupons.filter((c) => c.isActive && !isExpired(c.validUntil)).length, color: 'text-green-700' },
          { label: 'Total Uses', value: coupons.reduce((s, c) => s + c.usedCount, 0), color: 'text-ink' },
          { label: 'Expired / Disabled', value: coupons.filter((c) => !c.isActive || isExpired(c.validUntil)).length, color: 'text-ink-3' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize
              ${filter === f ? 'bg-ink text-paper border-ink' : 'border-line-soft text-ink-3 hover:border-ink-3'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-2 border-b border-line-soft">
            <tr>
              {['Code', 'Type', 'Value', 'Min Order', 'Valid Until', 'Uses', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered.map((c) => {
              const expired = isExpired(c.validUntil)
              const statusOk = c.isActive && !expired
              return (
                <tr key={c.id} className={`hover:bg-paper-2/50 transition-colors ${!statusOk ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-ink tracking-widest bg-paper-2 px-2 py-0.5 rounded text-sm">{c.code}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-[10px] ${TYPE_COLORS[c.type]}`}>{TYPE_LABELS[c.type]}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold text-ink">{formatValue(c)}</td>
                  <td className="px-5 py-4 text-ink-2 font-mono">
                    {c.minOrderAmount > 0 ? formatNPR(c.minOrderAmount) : '—'}
                  </td>
                  <td className="px-5 py-4 text-ink-2">
                    <p>{c.validUntil}</p>
                    {expired && <span className="text-crimson text-[10px] font-medium">Expired</span>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-mono text-ink">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</p>
                    {c.maxUses && (
                      <div className="w-16 h-1 bg-paper-3 rounded-full mt-1">
                        <div
                          className="h-full bg-crimson rounded-full"
                          style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-[10px] ${statusOk ? 'bg-green-100 text-green-700' : 'bg-paper-3 text-ink-3'}`}>
                      {statusOk ? 'Active' : expired ? 'Expired' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {!expired && (
                        <button
                          onClick={() => toggleActive(c.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors
                            ${c.isActive ? 'border-crimson/30 text-crimson hover:bg-crimson/5' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-line-soft text-ink-3 hover:border-crimson hover:text-crimson transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-ink-3">No coupons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl font-bold text-ink mb-5">Create Coupon</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Coupon Code *</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setF('code', e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    className="input-field font-mono tracking-widest uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Type *</label>
                  <select value={form.type} onChange={(e) => setF('type', e.target.value as CouponType)} className="input-field">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Rs.)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>
                {form.type !== 'FREE_SHIPPING' && (
                  <div>
                    <label className="block text-xs font-medium text-ink-3 mb-1.5">
                      {form.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (Rs.)'}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max={form.type === 'PERCENTAGE' ? 100 : undefined}
                      value={form.value}
                      onChange={(e) => setF('value', e.target.value)}
                      placeholder={form.type === 'PERCENTAGE' ? '10' : '500'}
                      className="input-field font-mono"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Min Order (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setF('minOrderAmount', e.target.value)}
                    placeholder="0"
                    className="input-field font-mono"
                  />
                </div>
                {form.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-xs font-medium text-ink-3 mb-1.5">Max Discount (Rs.) optional</label>
                    <input
                      type="number"
                      min="0"
                      value={form.maxDiscountAmount}
                      onChange={(e) => setF('maxDiscountAmount', e.target.value)}
                      placeholder="1000"
                      className="input-field font-mono"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Max Total Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setF('maxUses', e.target.value)}
                    placeholder="Unlimited"
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={form.perUserLimit}
                    onChange={(e) => setF('perUserLimit', e.target.value)}
                    placeholder="Unlimited"
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Valid From *</label>
                  <input
                    required
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setF('validFrom', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Valid Until *</label>
                  <input
                    required
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setF('validUntil', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Preview */}
              {form.code && (
                <div className="card p-3 bg-paper-2 border-dashed">
                  <p className="text-xs text-ink-3 mb-1">Preview</p>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-ink tracking-widest bg-white px-3 py-1 rounded border border-line-soft text-sm">{form.code || 'CODE'}</span>
                    <span className="text-sm text-ink-2">
                      {form.type === 'FREE_SHIPPING' ? 'Free shipping' :
                        form.type === 'PERCENTAGE' ? `${form.value || '0'}% off${form.maxDiscountAmount ? ` (max Rs. ${form.maxDiscountAmount})` : ''}` :
                        `Rs. ${form.value || '0'} off`}
                      {form.minOrderAmount ? ` · min Rs. ${form.minOrderAmount}` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setForm(defaultForm) }} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink mb-2">Delete Coupon?</h3>
            <p className="text-sm text-ink-3 mb-5">This action cannot be undone. All existing usage records will remain.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => deleteCoupon(deleteId)} className="btn-primary flex-1 bg-crimson hover:bg-crimson/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
