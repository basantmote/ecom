'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Order {
  id: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  total: number
  createdAt: string
  customer: {
    email: string | null
    phone: string | null
    profile: { fullName: string } | null
  }
  items: {
    id: string
    quantity: number
    variant: { product: { name: string } }
  }[]
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  PACKED: 'bg-cyan-100 text-cyan-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-paper-3 text-ink-3',
  REFUNDED: 'bg-red-100 text-red-600',
}

function formatNPR(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

export default function OrdersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/orders?${params}`)
      return res.data as { data: Order[]; meta: { total: number; totalPages: number } }
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Orders</h2>
          <p className="text-sm text-ink-3 mt-0.5">{meta ? `${meta.total} total orders` : 'Loading…'}</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field text-sm w-auto"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16 bg-paper-2" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-3">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-paper-2 border-b border-line-soft">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Items</th>
                  <th className="text-right px-4 py-3 font-medium text-ink-2">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Payment</th>
                  <th className="text-center px-4 py-3 font-medium text-ink-2">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-ink-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-paper-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-3">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {order.customer.profile?.fullName ?? order.customer.email ?? order.customer.phone ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      <p className="line-clamp-1">
                        {order.items[0]?.variant.product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-ink">
                      {formatNPR(order.total)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3">{order.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateStatus.isPending}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-crimson/30 ${STATUS_STYLES[order.status] ?? 'bg-paper-3 text-ink-3'}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-3 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-NP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-ink-3">Page {page} of {meta.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-ghost text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
