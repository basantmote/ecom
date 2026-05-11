'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

type PaymentMethod = 'ESEWA' | 'KHALTI' | 'COD' | 'CREDITS'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: 'ESEWA', label: 'eSewa', desc: 'Pay with your eSewa wallet' },
  { id: 'KHALTI', label: 'Khalti', desc: 'Pay with your Khalti wallet' },
  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { id: 'CREDITS', label: 'Store Credits', desc: 'Use your EcomNP balance' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCartStore()
  const userId = useAuthStore((s) => s.userId)
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
  })
  const [payment, setPayment] = useState<PaymentMethod>('COD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!userId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-ink mb-3">Sign in to continue</h2>
        <p className="text-ink-3 mb-6">You need to be signed in to place an order.</p>
        <a href="/login" className="btn-primary inline-flex">Sign in</a>
      </div>
    )
  }

  if (items.length === 0) {
    router.replace('/cart')
    return null
  }

  function setAddr(k: keyof typeof address, v: string) {
    setAddress((a) => ({ ...a, [k]: v }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const orderItems = items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        vendorId: i.vendorId,
      }))
      const { data } = await api.post('/orders', {
        deliveryAddress: address,
        paymentMethod: payment,
        items: orderItems,
      })
      clear()
      router.push(`/orders/${data.data.id}?success=1`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Left: Address + Payment */}
        <div className="flex-1 space-y-6">
          {/* Delivery address */}
          <section className="card p-5">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                required
                value={address.fullName}
                onChange={(e) => setAddr('fullName', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                required
                value={address.phone}
                onChange={(e) => setAddr('phone', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address line 1"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddr('addressLine1', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Address line 2 (optional)"
                  value={address.addressLine2}
                  onChange={(e) => setAddr('addressLine2', e.target.value)}
                />
              </div>
              <Input
                label="City"
                required
                value={address.city}
                onChange={(e) => setAddr('city', e.target.value)}
              />
              <Input
                label="District"
                required
                value={address.district}
                onChange={(e) => setAddr('district', e.target.value)}
              />
            </div>
          </section>

          {/* Payment method */}
          <section className="card p-5">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    payment === m.id ? 'border-ink bg-paper-2' : 'border-line-soft hover:border-ink-3'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-crimson"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{m.label}</p>
                    <p className="text-xs text-ink-3">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4 text-sm">
              {items.map((item) => (
                <li key={item.variantId} className="flex justify-between gap-2">
                  <span className="text-ink-2 line-clamp-1 flex-1">
                    {item.productName}{' '}
                    <span className="text-ink-3 text-xs">×{item.quantity}</span>
                  </span>
                  <span className="price font-medium text-ink flex-shrink-0">
                    {formatNPR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line-soft pt-3 mb-5">
              <div className="flex justify-between font-bold text-ink">
                <span>Total</span>
                <span className="price">{formatNPR(total())}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-crimson bg-red-50 border border-crimson/20 px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Place Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
