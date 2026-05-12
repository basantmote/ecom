'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'
import { Spinner } from '@/components/ui/Spinner'

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <svg className="w-16 h-16 text-line-soft mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
        </svg>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Your cart is empty</h2>
        <p className="text-ink-3 mb-6">Browse our products and add something you love.</p>
        <Link href="/products" className="btn-primary inline-flex">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">
        Cart <span className="text-ink-3 text-lg font-sans font-normal">({itemCount()} items)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Item list */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="card flex gap-4 p-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-paper-2">
                <Image src={item.image} alt={item.productName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm leading-snug mb-0.5 line-clamp-2">
                  {item.productName}
                </p>
                <p className="text-xs text-ink-3 mb-2">{item.variantLabel}</p>
                <div className="flex items-center gap-3">
                  {/* Quantity stepper */}
                  <div className="flex items-center border border-line-soft rounded">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-ink-2 hover:bg-paper-2 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-ink-2 hover:bg-paper-2 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-ink-3 hover:text-crimson transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="price font-bold text-ink">
                  {formatNPR(item.price * item.quantity)}
                </span>
                {item.quantity > 1 && (
                  <p className="text-xs text-ink-3 mt-0.5">{formatNPR(item.price)} each</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-ink-2">
                <span>Subtotal ({itemCount()} items)</span>
                <span className="price font-medium text-ink">{formatNPR(total())}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-line-soft pt-3 mb-5">
              <div className="flex justify-between font-bold text-ink">
                <span>Total</span>
                <span className="price">{formatNPR(total())}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full flex justify-center py-3">
              Proceed to Checkout
            </Link>
            <Link href="/products" className="btn-ghost w-full flex justify-center mt-2 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
