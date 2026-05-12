'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Spinner } from '@/components/ui/Spinner'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: string
  variant: {
    sku: string
    images: string[]
    product: { id: string; name: string; slug: string }
  }
}

interface StatusLog {
  id: string
  toStatus: string
  note: string | null
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string | null
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discountAmount: number
  deliveryFee: number
  total: number
  createdAt: string
  deliveryAddress: {
    recipientName: string
    recipientPhone: string
    street: string
    city: string
    province: string
  }
  items: OrderItem[]
  statusLogs: StatusLog[]
}

const STATUS_COLORS: Record<string, string> = {
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

function fmt(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const userId = useAuthStore((s) => s.userId)

  useEffect(() => {
    if (!userId) router.replace('/login')
  }, [userId, router])

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`)
      return res.data.data as Order
    },
    enabled: !!userId && !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-ink-3">Order not found.</p>
        <Link href="/account?tab=orders" className="btn-primary mt-4 inline-flex">My Orders</Link>
      </div>
    )
  }

  const displayId = order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account?tab=orders" className="btn-icon shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-xl font-bold text-ink">{displayId}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-paper-3 text-ink-3'}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-ink-3 mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Status timeline */}
        {order.statusLogs.length > 0 && (
          <div className="card p-5">
            <h2 className="font-semibold text-ink mb-4 text-sm">Order Timeline</h2>
            <ol className="space-y-3">
              {[...order.statusLogs].reverse().map((log, i) => (
                <li key={log.id} className="flex gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-crimson' : 'bg-paper-3'}`} />
                  <div>
                    <p className="text-sm font-medium text-ink">{log.toStatus.replace('_', ' ')}</p>
                    {log.note && <p className="text-xs text-ink-3">{log.note}</p>}
                    <p className="text-xs text-ink-3 mt-0.5">
                      {new Date(log.createdAt).toLocaleString('en-NP', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Items */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink mb-4 text-sm">Items ({order.items.length})</h2>
          <ul className="space-y-4">
            {order.items.map((item) => {
              const img = item.variant.images[0]
              return (
                <li key={item.id} className="flex items-center gap-4">
                  {img ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-paper-2">
                      <Image src={img} alt={item.variant.product.name} fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-paper-3 shrink-0 flex items-center justify-center text-xl">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.variant.product.slug}`} className="text-sm font-medium text-ink hover:text-crimson transition-colors line-clamp-1">
                      {item.variant.product.name}
                    </Link>
                    <p className="text-xs text-ink-3 mt-0.5 font-mono">
                      SKU: {item.variant.sku} · Qty: {item.quantity}
                    </p>
                    <p className="text-xs text-ink-3 font-mono">
                      Product #{item.variant.product.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold text-ink shrink-0">{fmt(item.totalPrice)}</p>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Price breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink mb-4 text-sm">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-2">
              <span>Subtotal</span>
              <span className="font-mono">{fmt(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span className="font-mono font-medium">−{fmt(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-2">
              <span>Delivery</span>
              <span className="font-mono">{fmt(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-ink text-base pt-2 border-t border-line-soft">
              <span>Total</span>
              <span className="font-mono">{fmt(order.total)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-line-soft grid grid-cols-2 gap-2 text-xs text-ink-3">
            <span>Payment method</span>
            <span className="text-right font-medium text-ink">{order.paymentMethod}</span>
            <span>Payment status</span>
            <span className="text-right font-medium text-ink">{order.paymentStatus}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-5">
          <h2 className="font-semibold text-ink mb-3 text-sm">Delivery Address</h2>
          <p className="text-sm font-medium text-ink">{order.deliveryAddress.recipientName}</p>
          <p className="text-sm text-ink-3 mt-0.5">{order.deliveryAddress.street}</p>
          <p className="text-sm text-ink-3">{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
          <p className="text-sm text-ink-3 mt-1">{order.deliveryAddress.recipientPhone}</p>
        </div>
      </div>
    </div>
  )
}
