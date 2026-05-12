'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: string
  order: {
    id: string
    createdAt: string
    paymentMethod: string
    customer: { phone: string | null; profile: { fullName: string } | null }
  }
  variant: {
    sku: string
    product: { name: string }
  }
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-paper-3 text-ink-3',
}

function formatNPR(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', page],
    queryFn: async () => {
      const res = await api.get(`/vendor/orders?page=${page}&limit=20`)
      return res.data as { data: OrderItem[]; meta: { total: number; totalPages: number } }
    },
  })

  const items = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">Orders</h2>
        <p className="text-sm text-ink-3 mt-0.5">
          {meta ? `${meta.total} total orders` : 'Loading…'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16 bg-paper-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-3">No orders yet. Orders will appear here once customers buy your products.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-2 border-b border-line-soft">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Customer</th>
                  <th className="text-center px-4 py-3 font-medium text-ink-2">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-2">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-ink-2">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-paper-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-3">
                      #{item.order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink line-clamp-1">{item.variant.product.name}</p>
                      <p className="text-xs text-ink-3">{item.variant.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      {item.order.customer.profile?.fullName ?? item.order.customer.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-ink-2">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-ink">
                      {formatNPR(item.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-ink-3 text-xs">{item.order.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] ?? 'bg-paper-3 text-ink-3'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">
                      {new Date(item.order.createdAt).toLocaleDateString('en-NP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-ink-3">Page {page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
