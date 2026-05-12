'use client'

import { useState } from 'react'

interface FlashSale {
  id: string
  title: string
  discount: number
  vendor: string
  product: string
  startTime: string
  endTime: string
  stockTotal: number
  stockLeft: number
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED'
}

const SALES: FlashSale[] = [
  { id: 'FS001', title: 'Mega Electronics Sale', discount: 25, vendor: 'TechHub Nepal', product: 'Samsung Galaxy A55', startTime: '11 May 10:00', endTime: '11 May 18:00', stockTotal: 50, stockLeft: 12, status: 'ACTIVE' },
  { id: 'FS002', title: 'Flash Footwear', discount: 30, vendor: 'Sports World', product: 'Nike Air Max 270', startTime: '11 May 14:00', endTime: '11 May 20:00', stockTotal: 30, stockLeft: 30, status: 'SCHEDULED' },
  { id: 'FS003', title: 'Beauty Blitz', discount: 40, vendor: 'Beauty Nepal', product: "L'Oréal Serum 30ml", startTime: '10 May 10:00', endTime: '10 May 22:00', stockTotal: 100, stockLeft: 0, status: 'ENDED' },
  { id: 'FS004', title: 'Kitchen Flash', discount: 18, vendor: 'Home Essentials', product: 'Philips Air Fryer', startTime: '12 May 09:00', endTime: '12 May 21:00', stockTotal: 20, stockLeft: 20, status: 'SCHEDULED' },
]

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ENDED: 'bg-paper-3 text-ink-3',
}

export default function FlashSalesPage() {
  const [filter, setFilter] = useState<'ALL' | FlashSale['status']>('ALL')
  const filtered = filter === 'ALL' ? SALES : SALES.filter((s) => s.status === filter)

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Flash Sales</h1>
          <p className="text-sm text-ink-3 mt-0.5">Manage platform-wide flash deals</p>
        </div>
        <button className="btn-primary">+ Create Flash Sale</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Now', value: SALES.filter((s) => s.status === 'ACTIVE').length, color: 'text-green-600' },
          { label: 'Scheduled', value: SALES.filter((s) => s.status === 'SCHEDULED').length, color: 'text-blue-600' },
          { label: 'Ended', value: SALES.filter((s) => s.status === 'ENDED').length, color: 'text-ink-3' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['ALL', 'ACTIVE', 'SCHEDULED', 'ENDED'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-crimson text-white' : 'bg-paper-2 text-ink-2 hover:bg-paper-3'
            }`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-2">
              <tr>
                {['Sale', 'Vendor / Product', 'Discount', 'Schedule', 'Stock', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-3 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {filtered.map((sale) => {
                const pct = Math.round(((sale.stockTotal - sale.stockLeft) / sale.stockTotal) * 100)
                return (
                  <tr key={sale.id} className="hover:bg-paper-2/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{sale.title}</p>
                      <p className="text-xs text-ink-3 font-mono">{sale.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink">{sale.vendor}</p>
                      <p className="text-xs text-ink-3">{sale.product}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-crimson/10 text-crimson font-mono">{sale.discount}% OFF</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">
                      <p>{sale.startTime}</p>
                      <p>→ {sale.endTime}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-paper-3 rounded-full overflow-hidden">
                          <div className="h-full bg-crimson rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-ink-3">{sale.stockLeft}/{sale.stockTotal}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusColors[sale.status]}`}>{sale.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="btn-ghost text-xs py-1.5 px-3">
                        {sale.status === 'ACTIVE' ? 'End' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
