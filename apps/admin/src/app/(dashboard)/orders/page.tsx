'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderListItem {
  id: string
  orderNumber: string | null
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

interface VendorItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: string
  variant: {
    id: string
    sku: string
    images: string[]
    attributes: Record<string, string>
    product: { id: string; name: string; slug: string }
  }
  vendor: {
    id: string
    storeName: string
    slug: string
    commissionRate: number
    bankName: string | null
    bankAccount: string | null
    bankHolder: string | null
  }
}

interface VendorBreakdown {
  vendor: VendorItem['vendor']
  items: VendorItem[]
  grossAmount: number
  commission: number
  netPayout: number
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
  acceptedAt: string | null
  pickedAt: string | null
  deliveredAt: string | null
  partner: DeliveryPartner
}

interface StatusLog {
  id: string
  fromStatus: string | null
  toStatus: string
  note: string | null
  createdAt: string
}

interface PaymentTransaction {
  id: string
  method: string
  amount: number
  status: string
  createdAt: string
}

interface OrderDetail {
  id: string
  orderNumber: string | null
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discountAmount: number
  deliveryFee: number
  total: number
  notes: string | null
  createdAt: string
  deliveryAddress: {
    recipientName: string
    recipientPhone: string
    street: string
    city: string
    province: string
  }
  customer: {
    email: string | null
    phone: string | null
    profile: { fullName: string } | null
  }
  items: VendorItem[]
  vendorBreakdown: VendorBreakdown[]
  statusLogs: StatusLog[]
  paymentTransactions: PaymentTransaction[]
  deliveryAssignment: DeliveryAssignment | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  ASSIGNED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  FAILED: 'bg-red-100 text-red-600',
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

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-purple-100 text-purple-700',
}

function fmt(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

function displayId(order: { orderNumber: string | null; id: string }) {
  return order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [assignPartnerId, setAssignPartnerId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/orders?${params}`)
      return res.data as { data: OrderListItem[]; meta: { total: number; totalPages: number } }
    },
  })

  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order-detail', selectedOrderId],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${selectedOrderId}`)
      return res.data.data as OrderDetail
    },
    enabled: !!selectedOrderId,
  })

  const { data: driversData } = useQuery({
    queryKey: ['admin-delivery-partners'],
    queryFn: async () => {
      const res = await api.get('/admin/delivery/partners')
      return res.data.data as DeliveryPartner[]
    },
    enabled: !!selectedOrderId,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-order-detail', selectedOrderId] })
    },
  })

  const assignDriver = useMutation({
    mutationFn: ({ orderId, partnerId }: { orderId: string; partnerId: string }) =>
      api.post(`/admin/orders/${orderId}/assign`, { partnerId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order-detail', selectedOrderId] })
      setAssignPartnerId('')
    },
  })

  const unassignDriver = useMutation({
    mutationFn: (orderId: string) => api.delete(`/admin/orders/${orderId}/assign`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-order-detail', selectedOrderId] })
    },
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
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
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-16 bg-paper-2" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-ink-3">No orders found.</p></div>
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
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrderId(order.id); setAssignPartnerId('') }}
                    className={`hover:bg-paper-2/50 transition-colors cursor-pointer ${selectedOrderId === order.id ? 'bg-crimson/4' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-crimson">
                      {displayId(order)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {order.customer.profile?.fullName ?? order.customer.email ?? order.customer.phone ?? '—'}
                      </p>
                      <p className="text-xs text-ink-3">{order.customer.email ?? order.customer.phone ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      <p className="line-clamp-1">
                        {order.items[0]?.variant.product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-ink">{fmt(order.total)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink-3">{order.paymentMethod}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES[order.paymentStatus] ?? 'bg-paper-3 text-ink-3'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); updateStatus.mutate({ id: order.id, status: e.target.value }) }}
                        disabled={updateStatus.isPending}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-crimson/30 ${STATUS_STYLES[order.status] ?? 'bg-paper-3 text-ink-3'}`}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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

      {/* Order Detail Panel */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)}>
          <div
            className="relative bg-paper h-full w-full max-w-2xl shadow-float border-l border-line-soft overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading || !orderDetail ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Panel header */}
                <div className="sticky top-0 bg-paper border-b border-line-soft px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-mono font-bold text-ink">{displayId(orderDetail)}</h2>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[orderDetail.status] ?? 'bg-paper-3 text-ink-3'}`}>
                        {orderDetail.status}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAYMENT_STATUS_STYLES[orderDetail.paymentStatus] ?? 'bg-paper-3 text-ink-3'}`}>
                        {orderDetail.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-ink-3 mt-0.5">
                      {new Date(orderDetail.createdAt).toLocaleString('en-NP', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={orderDetail.status}
                      onChange={(e) => updateStatus.mutate({ id: orderDetail.id, status: e.target.value })}
                      disabled={updateStatus.isPending}
                      className="input-field text-xs py-1.5 w-auto"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setSelectedOrderId(null)} className="btn-icon shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer + delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <section>
                      <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Customer</h3>
                      <div className="card p-4 space-y-1">
                        <p className="font-medium text-sm text-ink">{orderDetail.customer.profile?.fullName ?? '—'}</p>
                        <p className="text-xs text-ink-3">{orderDetail.customer.email ?? '—'}</p>
                        <p className="text-xs text-ink-3">{orderDetail.customer.phone ?? '—'}</p>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Delivery Address</h3>
                      <div className="card p-4 space-y-0.5">
                        <p className="font-medium text-sm text-ink">{orderDetail.deliveryAddress.recipientName}</p>
                        <p className="text-xs text-ink-3">{orderDetail.deliveryAddress.street}</p>
                        <p className="text-xs text-ink-3">{orderDetail.deliveryAddress.city}, {orderDetail.deliveryAddress.province}</p>
                        <p className="text-xs text-ink-3">{orderDetail.deliveryAddress.recipientPhone}</p>
                      </div>
                    </section>
                  </div>

                  {/* Delivery Assignment */}
                  <section>
                    <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Delivery Assignment</h3>
                    <div className="card overflow-hidden">
                      {orderDetail.deliveryAssignment ? (
                        <>
                          <div className="flex items-center gap-3 px-4 py-3 bg-paper-2 border-b border-line-soft">
                            <div className="w-9 h-9 rounded-full bg-paper-3 flex items-center justify-center text-lg shrink-0">
                              {VEHICLE_ICON[orderDetail.deliveryAssignment.partner.vehicleType] ?? '🚗'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-ink">{orderDetail.deliveryAssignment.partner.user.profile?.fullName ?? '—'}</p>
                              <p className="text-xs text-ink-3">
                                {orderDetail.deliveryAssignment.partner.user.phone} · {orderDetail.deliveryAssignment.partner.vehicleType} · {orderDetail.deliveryAssignment.partner.licensePlate}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ASSIGNMENT_STATUS_STYLES[orderDetail.deliveryAssignment.status] ?? 'bg-paper-3 text-ink-3'}`}>
                                {orderDetail.deliveryAssignment.status}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${PARTNER_STATUS_DOT[orderDetail.deliveryAssignment.partner.status] ?? 'bg-paper-3'}`} />
                                <span className="text-[10px] text-ink-3">{orderDetail.deliveryAssignment.partner.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-xs font-medium text-ink-3">Reassign to another driver</p>
                            <div className="flex gap-2">
                              <select
                                value={assignPartnerId}
                                onChange={(e) => setAssignPartnerId(e.target.value)}
                                className="input-field text-xs py-1.5 flex-1"
                              >
                                <option value="">Select driver…</option>
                                {(driversData ?? []).map((d) => (
                                  <option key={d.id} value={d.id} disabled={d.status === 'OFFLINE'}>
                                    {VEHICLE_ICON[d.vehicleType] ?? '🚗'} {d.user.profile?.fullName ?? d.user.phone} — {d.status}
                                  </option>
                                ))}
                              </select>
                              <button
                                disabled={!assignPartnerId || assignDriver.isPending}
                                onClick={() => assignDriver.mutate({ orderId: orderDetail.id, partnerId: assignPartnerId })}
                                className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap disabled:opacity-50"
                              >
                                Reassign
                              </button>
                            </div>
                            <button
                              onClick={() => unassignDriver.mutate(orderDetail.id)}
                              disabled={unassignDriver.isPending}
                              className="text-xs text-crimson hover:underline disabled:opacity-50"
                            >
                              Unassign driver
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-4 space-y-3">
                          <p className="text-sm text-ink-3">No driver assigned yet.</p>
                          <div className="flex gap-2">
                            <select
                              value={assignPartnerId}
                              onChange={(e) => setAssignPartnerId(e.target.value)}
                              className="input-field text-xs py-1.5 flex-1"
                            >
                              <option value="">Select driver…</option>
                              {(driversData ?? []).map((d) => (
                                <option key={d.id} value={d.id} disabled={d.status === 'OFFLINE'}>
                                  {VEHICLE_ICON[d.vehicleType] ?? '🚗'} {d.user.profile?.fullName ?? d.user.phone} — {d.status}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!assignPartnerId || assignDriver.isPending}
                              onClick={() => assignDriver.mutate({ orderId: orderDetail.id, partnerId: assignPartnerId })}
                              className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap disabled:opacity-50"
                            >
                              {assignDriver.isPending ? 'Assigning…' : 'Assign'}
                            </button>
                          </div>
                          {assignDriver.isError && (
                            <p className="text-xs text-crimson">Failed to assign driver. Please try again.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Vendor breakdown — the core feature */}
                  <section>
                    <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">
                      Vendor Breakdown ({orderDetail.vendorBreakdown.length} vendor{orderDetail.vendorBreakdown.length !== 1 ? 's' : ''})
                    </h3>
                    <div className="space-y-4">
                      {orderDetail.vendorBreakdown.map(({ vendor, items, grossAmount, commission, netPayout }) => (
                        <div key={vendor.id} className="card overflow-hidden">
                          {/* Vendor header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-paper-2 border-b border-line-soft">
                            <div>
                              <p className="font-semibold text-ink text-sm">{vendor.storeName}</p>
                              <p className="text-xs text-ink-3 font-mono">/{vendor.slug} · {vendor.commissionRate}% commission</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Items */}
                          <ul className="divide-y divide-line-soft">
                            {items.map((item) => (
                              <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                                {item.variant.images[0] ? (
                                  <img src={item.variant.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-paper-2" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-paper-3 shrink-0 flex items-center justify-center text-lg">📦</div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-ink line-clamp-1">{item.variant.product.name}</p>
                                  <p className="text-xs text-ink-3 font-mono">
                                    SKU: {item.variant.sku} · #{item.variant.product.id.slice(-8).toUpperCase()}
                                  </p>
                                  {Object.keys(item.variant.attributes ?? {}).length > 0 && (
                                    <p className="text-xs text-ink-3">
                                      {Object.entries(item.variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-mono text-sm font-medium text-ink">{fmt(item.totalPrice)}</p>
                                  <p className="text-xs text-ink-3">×{item.quantity} @ {fmt(item.unitPrice)}</p>
                                </div>
                              </li>
                            ))}
                          </ul>

                          {/* Payout summary */}
                          <div className="px-4 py-3 bg-paper-2/50 border-t border-line-soft space-y-1.5 text-sm">
                            <div className="flex justify-between text-ink-2">
                              <span>Gross amount</span>
                              <span className="font-mono">{fmt(grossAmount)}</span>
                            </div>
                            <div className="flex justify-between text-crimson/80">
                              <span>Platform commission ({vendor.commissionRate}%)</span>
                              <span className="font-mono">−{fmt(commission)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-ink border-t border-line-soft pt-1.5">
                              <span>Vendor net payout</span>
                              <span className="font-mono text-green-700">{fmt(netPayout)}</span>
                            </div>
                          </div>

                          {/* Bank details for payout */}
                          <div className="px-4 py-3 border-t border-line-soft">
                            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">Payout Bank Account</p>
                            {vendor.bankAccount ? (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <span className="text-ink-3">Bank</span>
                                <span className="text-ink font-medium">{vendor.bankName ?? '—'}</span>
                                <span className="text-ink-3">Account</span>
                                <span className="text-ink font-mono">{vendor.bankAccount}</span>
                                <span className="text-ink-3">Holder</span>
                                <span className="text-ink">{vendor.bankHolder ?? '—'}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-ink-3 italic">No bank details on file for this vendor.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Payment summary */}
                  <section>
                    <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Payment Summary</h3>
                    <div className="card p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-ink-2">
                        <span>Subtotal</span>
                        <span className="font-mono">{fmt(orderDetail.subtotal)}</span>
                      </div>
                      {orderDetail.discountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Discount</span>
                          <span className="font-mono font-medium">−{fmt(orderDetail.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-ink-2">
                        <span>Delivery fee</span>
                        <span className="font-mono">{fmt(orderDetail.deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink text-base border-t border-line-soft pt-2">
                        <span>Total charged</span>
                        <span className="font-mono">{fmt(orderDetail.total)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-line-soft text-xs text-ink-3">
                        <span>Payment method</span>
                        <span className="text-right font-medium text-ink">{orderDetail.paymentMethod}</span>
                        <span>Payment status</span>
                        <span className={`text-right font-medium px-1.5 py-0.5 rounded-full w-fit ml-auto ${PAYMENT_STATUS_STYLES[orderDetail.paymentStatus] ?? ''}`}>
                          {orderDetail.paymentStatus}
                        </span>
                        <span>Total platform commission</span>
                        <span className="text-right font-medium text-crimson font-mono">
                          {fmt(orderDetail.vendorBreakdown.reduce((s, v) => s + v.commission, 0))}
                        </span>
                        <span>Total vendor payouts</span>
                        <span className="text-right font-medium text-green-700 font-mono">
                          {fmt(orderDetail.vendorBreakdown.reduce((s, v) => s + v.netPayout, 0))}
                        </span>
                      </div>

                      {/* Payment transactions */}
                      {orderDetail.paymentTransactions.length > 0 && (
                        <div className="pt-2 border-t border-line-soft space-y-1">
                          <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider">Transactions</p>
                          {orderDetail.paymentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between text-xs">
                              <span className="text-ink-2">{tx.method} · {new Date(tx.createdAt).toLocaleDateString('en-NP')}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-ink">{fmt(tx.amount)}</span>
                                <span className={`px-1.5 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_STYLES[tx.status] ?? 'bg-paper-3 text-ink-3'}`}>{tx.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Status timeline */}
                  {orderDetail.statusLogs.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-3">Order Timeline</h3>
                      <div className="card p-4">
                        <ol className="space-y-3">
                          {[...orderDetail.statusLogs].reverse().map((log, i) => (
                            <li key={log.id} className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-crimson' : 'bg-paper-3'}`} />
                              <div>
                                <p className="text-sm font-medium text-ink">{log.toStatus.replace('_', ' ')}</p>
                                {log.note && <p className="text-xs text-ink-3">{log.note}</p>}
                                <p className="text-xs text-ink-3">
                                  {new Date(log.createdAt).toLocaleString('en-NP', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
