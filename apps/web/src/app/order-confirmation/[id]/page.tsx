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
  variant: {
    sku: string
    images: string[]
    product: { id: string; name: string }
  }
}

interface Order {
  id: string
  orderNumber: string | null
  status: string
  paymentMethod: string
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
}

function fmt(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

export default function OrderConfirmationPage() {
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

  if (isLoading || !order) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const displayId = order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`
  const isCOD = order.paymentMethod === 'COD'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Thank you for your order!</h1>
        <p className="text-ink-3 text-sm">
          {isCOD
            ? 'Your order has been placed. Pay cash when it arrives.'
            : 'Your payment was successful. We\'re preparing your order.'}
        </p>
      </div>

      {/* Order ID card */}
      <div className="card p-6 mb-6 text-center border-crimson/20 bg-crimson/3">
        <p className="text-xs font-medium text-ink-3 uppercase tracking-widest mb-1">Order ID</p>
        <p className="font-mono text-2xl font-bold text-crimson tracking-wider">{displayId}</p>
        <p className="text-xs text-ink-3 mt-2">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Order items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-ink mb-4 text-sm">Order Items</h2>
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
                  <p className="text-sm font-medium text-ink line-clamp-1">{item.variant.product.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5 font-mono">SKU: {item.variant.sku} · Qty: {item.quantity}</p>
                  <p className="text-xs text-ink-3 font-mono">Product ID: {item.variant.product.id.slice(-8).toUpperCase()}</p>
                </div>
                <p className="font-mono text-sm font-bold text-ink shrink-0">{fmt(item.totalPrice)}</p>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Price summary */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-ink mb-4 text-sm">Price Summary</h2>
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
        <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between text-xs text-ink-3">
          <span>Payment method</span>
          <span className="font-medium text-ink">{order.paymentMethod}</span>
        </div>
      </div>

      {/* Delivery address */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold text-ink mb-3 text-sm">Delivery Address</h2>
        <p className="text-sm font-medium text-ink">{order.deliveryAddress.recipientName}</p>
        <p className="text-sm text-ink-3 mt-0.5">{order.deliveryAddress.street}</p>
        <p className="text-sm text-ink-3">{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
        <p className="text-sm text-ink-3 mt-1">{order.deliveryAddress.recipientPhone}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/account?tab=orders"
          className="btn-primary flex-1 text-center justify-center"
        >
          View My Orders
        </Link>
        <Link
          href="/products"
          className="btn-secondary flex-1 text-center justify-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
