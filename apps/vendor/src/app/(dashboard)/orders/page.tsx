'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: string
  order: {
    id: string
    orderNumber: string | null
    createdAt: string
    paymentMethod: string
    customer: { phone: string | null; profile: { fullName: string } | null }
  }
  variant: {
    sku: string
    product: { id: string; name: string }
  }
}

interface DeliveryPartner {
  id: string
  vehicleType: string
  licensePlate: string
  status: string
  user: { phone: string | null; profile: { fullName: string } | null }
}

interface DeliveryAssignment {
  id: string
  status: string
  assignedAt: string
  partner: DeliveryPartner
}

interface OrderWithAssignment {
  id: string
  orderNumber: string | null
  deliveryAssignment: DeliveryAssignment | null
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-paper-3 text-ink-3',
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  ASSIGNED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

const VEHICLE_ICON: Record<string, string> = {
  BIKE: '🛵',
  SCOOTER: '🛵',
  VAN: '🚐',
  TRUCK: '🚛',
}

const PARTNER_STATUS_DOT: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  BUSY: 'bg-amber-400',
  OFFLINE: 'bg-paper-3',
}

function formatNPR(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

// ─── Assign Driver Modal ──────────────────────────────────────────────────────

function AssignDriverModal({
  orderId,
  orderLabel,
  onClose,
}: {
  orderId: string
  orderLabel: string
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [selectedPartnerId, setSelectedPartnerId] = useState('')

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['vendor-order-detail', orderId],
    queryFn: async () => {
      const res = await api.get(`/vendor/orders/${orderId}`)
      return res.data.data as OrderWithAssignment
    },
  })

  const { data: driversData, isLoading: driversLoading } = useQuery({
    queryKey: ['vendor-delivery-partners'],
    queryFn: async () => {
      const res = await api.get('/vendor/delivery/partners')
      return res.data.data as DeliveryPartner[]
    },
  })

  const assign = useMutation({
    mutationFn: (partnerId: string) => api.post(`/vendor/orders/${orderId}/assign`, { partnerId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-order-detail', orderId] })
      setSelectedPartnerId('')
    },
  })

  const unassign = useMutation({
    mutationFn: () => api.delete(`/vendor/orders/${orderId}/assign`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-order-detail', orderId] })
    },
  })

  const assignment = orderData?.deliveryAssignment
  const isLoading = orderLoading || driversLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-paper rounded-2xl shadow-float w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft">
          <div>
            <h3 className="font-semibold text-ink">Assign Delivery Driver</h3>
            <p className="text-xs text-ink-3 font-mono mt-0.5">{orderLabel}</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Current assignment */}
              {assignment && (
                <div className="rounded-xl border border-line-soft bg-paper-2 p-4">
                  <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Currently Assigned</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-paper-3 flex items-center justify-center text-lg shrink-0">
                      {VEHICLE_ICON[assignment.partner.vehicleType] ?? '🚗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink">{assignment.partner.user.profile?.fullName ?? '—'}</p>
                      <p className="text-xs text-ink-3">{assignment.partner.user.phone} · {assignment.partner.licensePlate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ASSIGNMENT_STATUS_STYLES[assignment.status] ?? 'bg-paper-3 text-ink-3'}`}>
                        {assignment.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${PARTNER_STATUS_DOT[assignment.partner.status] ?? 'bg-paper-3'}`} />
                        <span className="text-[10px] text-ink-3">{assignment.partner.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unassign.mutate()}
                    disabled={unassign.isPending}
                    className="mt-3 text-xs text-crimson hover:underline disabled:opacity-50"
                  >
                    {unassign.isPending ? 'Removing…' : 'Unassign driver'}
                  </button>
                </div>
              )}

              {/* Driver list */}
              <div>
                <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
                  {assignment ? 'Reassign to' : 'Available Drivers'}
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(driversData ?? []).map((driver) => (
                    <label
                      key={driver.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedPartnerId === driver.id
                          ? 'border-crimson bg-crimson/4'
                          : driver.status === 'OFFLINE'
                          ? 'border-line-soft opacity-50 cursor-not-allowed'
                          : 'border-line-soft hover:border-ink-3'
                      }`}
                    >
                      <input
                        type="radio"
                        name="driver"
                        value={driver.id}
                        checked={selectedPartnerId === driver.id}
                        onChange={() => driver.status !== 'OFFLINE' && setSelectedPartnerId(driver.id)}
                        disabled={driver.status === 'OFFLINE'}
                        className="accent-crimson shrink-0"
                      />
                      <div className="text-lg shrink-0">{VEHICLE_ICON[driver.vehicleType] ?? '🚗'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">{driver.user.profile?.fullName ?? driver.user.phone ?? '—'}</p>
                        <p className="text-xs text-ink-3">{driver.vehicleType} · {driver.licensePlate}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${PARTNER_STATUS_DOT[driver.status] ?? 'bg-paper-3'}`} />
                        <span className="text-xs text-ink-3">{driver.status}</span>
                      </div>
                    </label>
                  ))}
                  {(driversData ?? []).length === 0 && (
                    <p className="text-sm text-ink-3 text-center py-4">No drivers available.</p>
                  )}
                </div>
              </div>

              {assign.isError && (
                <p className="text-xs text-crimson">Failed to assign. Please try again.</p>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button
                  disabled={!selectedPartnerId || assign.isPending}
                  onClick={() => assign.mutate(selectedPartnerId)}
                  className="btn-primary flex-1 text-sm disabled:opacity-50"
                >
                  {assign.isPending ? 'Assigning…' : assignment ? 'Reassign' : 'Assign Driver'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [assignTarget, setAssignTarget] = useState<{ orderId: string; label: string } | null>(null)

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
                  <th className="text-center px-4 py-3 font-medium text-ink-2">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {items.map((item) => {
                  const orderLabel = item.order.orderNumber ?? `#${item.order.id.slice(-8).toUpperCase()}`
                  return (
                    <tr key={item.id} className="hover:bg-paper-2/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-ink-3">
                        {orderLabel}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink line-clamp-1">{item.variant.product.name}</p>
                        <p className="text-xs text-ink-3">SKU: {item.variant.sku}</p>
                        <p className="text-xs text-ink-3/60 font-mono">#{item.variant.product.id.slice(-8).toUpperCase()}</p>
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
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setAssignTarget({ orderId: item.order.id, label: orderLabel })}
                          className="text-xs font-medium text-crimson hover:underline whitespace-nowrap"
                        >
                          Assign Driver
                        </button>
                      </td>
                    </tr>
                  )
                })}
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

      {assignTarget && (
        <AssignDriverModal
          orderId={assignTarget.orderId}
          orderLabel={assignTarget.label}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  )
}
