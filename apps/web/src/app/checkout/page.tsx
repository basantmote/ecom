'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

type PaymentMethod = 'ESEWA' | 'KHALTI' | 'COD' | 'CREDIT'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: string }[] = [
  { id: 'ESEWA', label: 'eSewa', desc: 'Pay with your eSewa wallet' },
  { id: 'KHALTI', label: 'Khalti', desc: 'Pay with your Khalti wallet' },
  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { id: 'CREDIT', label: 'Store Credits', desc: 'Use your EcomNP balance' },
]

const DELIVERY_FEE = 10000 // Rs. 100 in paisa

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCartStore()
  const userId = useAuthStore((s) => s.userId)
  const [mounted, setMounted] = useState(false)

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

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string
    code: string
    type: string
    discountAmount: number
    message: string
  } | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace('/cart')
    }
  }, [mounted, items.length, router])

  if (!mounted) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

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
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  function setAddr(k: keyof typeof address, v: string) {
    setAddress((a) => ({ ...a, [k]: v }))
    setError('')
  }

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const cartTotal = total()
      const { data } = await api.post('/promotions/coupons/validate', {
        code: promoCode.trim().toUpperCase(),
        cartTotal,
      })
      setAppliedCoupon({ ...data.data, code: promoCode.trim().toUpperCase() })
      setPromoError('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setPromoError(msg ?? 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setPromoLoading(false)
    }
  }

  function removePromo() {
    setAppliedCoupon(null)
    setPromoCode('')
    setPromoError('')
  }

  const subtotal = total()
  const discount = appliedCoupon?.discountAmount ?? 0
  const finalTotal = Math.max(0, subtotal - discount) + DELIVERY_FEE

  // Submit eSewa form to payment gateway
  function redirectToEsewa(paymentUrl: string, params: Record<string, string>) {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentUrl
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(value)
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Step 1: Sync local cart items to the DB cart so the order API can read them
      await Promise.all(
        items.map((item) =>
          api.post('/cart/items', { variantId: item.variantId, quantity: item.quantity }),
        ),
      )

      // Step 2: Create the order
      const { data } = await api.post('/orders', {
        deliveryAddress: {
          label: 'Home',
          street: address.addressLine1 + (address.addressLine2 ? ', ' + address.addressLine2 : ''),
          city: address.city,
          province: address.district,
          recipientName: address.fullName,
          recipientPhone: address.phone,
        },
        paymentMethod: payment,
        couponCode: appliedCoupon?.code ?? undefined,
      })

      const orderId: string = data.data.id
      clear() // clear local Zustand cart (DB cart is cleared by the order API)

      // Step 3: Handle payment method
      if (payment === 'COD' || payment === 'CREDIT') {
        router.push(`/order-confirmation/${orderId}`)
        return
      }

      if (payment === 'ESEWA') {
        const { data: payData } = await api.post('/payments/esewa/initiate', { orderId })
        redirectToEsewa(payData.data.paymentUrl, payData.data.params)
        return
      }

      if (payment === 'KHALTI') {
        const { data: payData } = await api.post('/payments/khalti/initiate', { orderId })
        window.location.href = payData.data.payment_url
        return
      }
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
            {(payment === 'ESEWA' || payment === 'KHALTI') && (
              <p className="text-xs text-ink-3 mt-3 bg-paper-2 rounded-lg px-3 py-2">
                You will be redirected to {payment === 'ESEWA' ? 'eSewa' : 'Khalti'} to complete payment after placing the order.
              </p>
            )}
          </section>
        </div>

        {/* Right: Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Order Summary</h2>

            {/* Items */}
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

            {/* Promo code */}
            <div className="border-t border-line-soft pt-4 mb-4">
              <p className="text-xs font-medium text-ink-3 mb-2">Promo Code</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="font-mono text-sm font-bold text-green-800 tracking-widest">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-700 mt-0.5">{appliedCoupon.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-green-600 hover:text-crimson transition-colors ml-2"
                    aria-label="Remove coupon"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                    placeholder="Enter code"
                    className="input-field flex-1 font-mono tracking-widest uppercase text-sm py-2"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="btn-secondary text-sm py-2 px-3 whitespace-nowrap disabled:opacity-50"
                  >
                    {promoLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-xs text-crimson mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {promoError}
                </p>
              )}
              {!appliedCoupon && !promoError && (
                <p className="text-[11px] text-ink-3 mt-1.5">Try: WELCOME10 · SAVE500 · FREESHIP</p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm border-t border-line-soft pt-4 mb-5">
              <div className="flex justify-between text-ink-2">
                <span>Subtotal</span>
                <span className="font-mono">{formatNPR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono font-medium">−{formatNPR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-2">
                <span>Delivery</span>
                <span className="font-mono">{formatNPR(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between font-bold text-ink text-base pt-1 border-t border-line-soft">
                <span>Total</span>
                <span className="price">{formatNPR(finalTotal)}</span>
              </div>
              {discount > 0 && (
                <p className="text-[11px] text-green-700 text-right font-medium">
                  You save {formatNPR(discount)} with {appliedCoupon?.code}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs text-crimson bg-red-50 border border-crimson/20 px-3 py-2 rounded-md mb-3">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {payment === 'ESEWA' || payment === 'KHALTI'
                ? `Pay with ${payment === 'ESEWA' ? 'eSewa' : 'Khalti'} · ${formatNPR(finalTotal)}`
                : `Place Order · ${formatNPR(finalTotal)}`}
            </Button>

            <p className="text-[11px] text-ink-3 text-center mt-3 leading-relaxed">
              By placing this order you agree to our terms. Secure payment with 256-bit SSL.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
