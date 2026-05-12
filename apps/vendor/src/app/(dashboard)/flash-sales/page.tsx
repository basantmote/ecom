'use client'

import { useState } from 'react'

interface VendorFlashSale {
  id: string
  product: string
  originalPrice: number
  salePrice: number
  discount: number
  stock: number
  stockLeft: number
  startTime: string
  endTime: string
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED' | 'PENDING_APPROVAL'
}

const SALES: VendorFlashSale[] = [
  { id: 'VFS001', product: 'Samsung Galaxy A55', originalPrice: 5499900, salePrice: 4124900, discount: 25, stock: 10, stockLeft: 3, startTime: '11 May 10:00', endTime: '11 May 18:00', status: 'ACTIVE' },
  { id: 'VFS002', product: 'Wireless Earbuds Pro', originalPrice: 349900, salePrice: 244900, discount: 30, stock: 20, stockLeft: 20, startTime: '12 May 14:00', endTime: '12 May 20:00', status: 'SCHEDULED' },
  { id: 'VFS003', product: 'Mechanical Keyboard', originalPrice: 549900, salePrice: 412400, discount: 25, stock: 8, stockLeft: 8, startTime: '13 May 09:00', endTime: '13 May 21:00', status: 'PENDING_APPROVAL' },
  { id: 'VFS004', product: 'USB-C Hub 7-in-1', originalPrice: 189900, salePrice: 113900, discount: 40, stock: 15, stockLeft: 0, startTime: '9 May 10:00', endTime: '9 May 22:00', status: 'ENDED' },
]

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ENDED: 'bg-paper-3 text-ink-3',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
}

export default function VendorFlashSalesPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Flash Sales</h1>
          <p className="text-sm text-ink-3 mt-0.5">Run limited-time deals on your products</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ Create Flash Sale</button>
      </div>

      {/* Info banner */}
      <div className="card p-4 border-blue-200 bg-blue-50 flex items-start gap-3">
        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-800">Flash sales require admin approval before going live. Approval typically takes 2–4 hours.</p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {SALES.map((sale) => {
          const soldPct = Math.round(((sale.stock - sale.stockLeft) / sale.stock) * 100)
          return (
            <div key={sale.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-ink">{sale.product}</p>
                  <p className="text-xs text-ink-3 font-mono mt-0.5">{sale.id}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="badge bg-crimson/10 text-crimson font-mono">{sale.discount}% OFF</span>
                  <span className={`badge ${statusColors[sale.status]}`}>{sale.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <p className="text-ink-3 text-xs">Original</p>
                  <p className="font-mono text-ink line-through">Rs. {(sale.originalPrice / 100).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-ink-3 text-xs">Sale Price</p>
                  <p className="font-mono text-crimson font-bold">Rs. {(sale.salePrice / 100).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-ink-3 text-xs">Schedule</p>
                  <p className="text-ink text-xs">{sale.startTime} → {sale.endTime}</p>
                </div>
                <div>
                  <p className="text-ink-3 text-xs mb-1">Stock ({sale.stockLeft}/{sale.stock} left)</p>
                  <div className="w-full h-1.5 bg-paper-3 rounded-full overflow-hidden">
                    <div className="h-full bg-crimson rounded-full transition-all" style={{ width: `${soldPct}%` }} />
                  </div>
                </div>
              </div>
              {sale.status !== 'ENDED' && (
                <div className="flex gap-2">
                  <button className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                  {sale.status === 'ACTIVE' && (
                    <button className="btn-ghost text-xs py-1.5 px-3 text-crimson">End Early</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-serif text-xl font-bold text-ink mb-5">Create Flash Sale</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Product</label>
                <select className="input-field">
                  <option>Samsung Galaxy A55</option>
                  <option>Wireless Earbuds Pro</option>
                  <option>Mechanical Keyboard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Discount (%)</label>
                  <input type="number" min="5" max="70" placeholder="20" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Stock Units</label>
                  <input type="number" min="1" placeholder="10" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">Start Time</label>
                  <input type="datetime-local" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-3 mb-1.5">End Time</label>
                  <input type="datetime-local" className="input-field" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="btn-primary flex-1">Submit for Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
