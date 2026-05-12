'use client'

import { useState } from 'react'

const PAYOUTS = [
  { id: 'PAY-0091', amount: 4284000, method: 'eSewa', date: '1 May 2026', status: 'COMPLETED' },
  { id: 'PAY-0078', amount: 3156000, method: 'eSewa', date: '15 Apr 2026', status: 'COMPLETED' },
  { id: 'PAY-0064', amount: 2891000, method: 'Khalti', date: '1 Apr 2026', status: 'COMPLETED' },
  { id: 'PAY-0051', amount: 3540000, method: 'eSewa', date: '15 Mar 2026', status: 'COMPLETED' },
  { id: 'PAY-0038', amount: 1984000, method: 'eSewa', date: '1 Mar 2026', status: 'COMPLETED' },
]

export default function PayoutsPage() {
  const [showModal, setShowModal] = useState(false)
  const pending = 1842000

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Payouts</h1>
        <p className="text-sm text-ink-3 mt-0.5">Your settlement history and pending balance</p>
      </div>

      {/* Pending banner */}
      <div className="card p-5 border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-800">Pending Settlement</p>
          <p className="font-mono text-2xl font-bold text-amber-900 mt-0.5">
            Rs. {(pending / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-amber-700 mt-1">From orders delivered May 1–11 · Processed within 2 business days</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-secondary shrink-0 whitespace-nowrap">
          Request Payout
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'This Month', value: 'Rs. 28,475' },
          { label: 'Last Month', value: 'Rs. 42,840' },
          { label: 'Total Paid', value: 'Rs. 1,58,550' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="font-mono text-xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-line-soft">
          <h2 className="font-semibold text-ink">Payout History</h2>
        </div>
        <div className="divide-y divide-line-soft">
          {PAYOUTS.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink font-mono">{p.id}</p>
                  <p className="text-xs text-ink-3">{p.date} · {p.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-green-700">+Rs. {(p.amount / 100).toLocaleString('en-IN')}</p>
                <span className="badge bg-green-100 text-green-700 text-[10px]">COMPLETED</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-serif text-xl font-bold text-ink mb-1">Request Payout</h2>
            <p className="text-sm text-ink-3 mb-5">Available: <span className="font-mono font-bold text-ink">Rs. {(pending / 100).toLocaleString('en-IN')}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Payout Method</label>
                <select className="input-field">
                  <option>eSewa — 9841234567</option>
                  <option>Khalti</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Amount (Rs.)</label>
                <input type="number" defaultValue={(pending / 100).toString()} className="input-field font-mono" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setShowModal(false)} className="btn-primary flex-1">Confirm Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
