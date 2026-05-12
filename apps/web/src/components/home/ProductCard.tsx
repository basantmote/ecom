'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'

interface ProductCardProps {
  slug: string
  name: string
  vendorName: string
  price: number
  originalPrice?: number
  imageUrl: string
  rating?: number
  reviewCount?: number
  isFlashSale?: boolean
  variantId?: string
  vendorId?: string
  productId?: string
  outOfStock?: boolean
}

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

export function ProductCard({
  slug,
  name,
  vendorName,
  price,
  originalPrice,
  imageUrl,
  rating,
  reviewCount,
  isFlashSale,
  variantId,
  vendorId,
  productId,
  outOfStock = false,
}: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const wishlist = useWishlistStore()
  const isLoggedIn = useAuthStore((s) => !!s.accessToken)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isWishlisted = productId ? wishlist.has(productId) : false
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0
  const savings = originalPrice ? originalPrice - price : 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!variantId || !vendorId) return
    setAdding(true)
    addItem({
      variantId,
      productName: name,
      variantLabel: 'Default',
      price,
      quantity: 1,
      image: imageUrl,
      vendorId,
    })
    setTimeout(() => {
      setAdding(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    }, 300)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!isLoggedIn) { router.push('/login'); return }
    if (!productId) return
    wishlist.toggle(productId, variantId)
  }

  return (
    <Link href={`/products/${slug}`} className="group relative flex flex-col rounded-2xl overflow-hidden bg-paper border border-line-soft shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">

      {/* Image area */}
      <div className="relative aspect-square bg-paper-2 overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-paper/70 flex items-center justify-center z-10">
            <span className="bg-ink text-paper text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isFlashSale && (
            <span className="badge bg-crimson text-white text-[10px] shadow-sm">
              ⚡ FLASH
            </span>
          )}
          {discount >= 5 && !isFlashSale && (
            <span className="badge bg-ink text-paper text-[10px] shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist — top right */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center
                     transition-all duration-200 active:scale-90 z-10
                     ${isWishlisted
                       ? 'bg-crimson/10 text-crimson'
                       : 'bg-paper/70 text-ink-3 opacity-0 group-hover:opacity-100'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className="w-3.5 h-3.5 transition-colors"
            fill={isWishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick-add button — slides up on hover */}
        {variantId && vendorId && !outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 text-xs font-bold text-white flex items-center justify-center gap-1.5
                         bg-ink hover:bg-ink-2 transition-colors"
            >
              {adding ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : added ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Added to cart
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Quick Add
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[11px] text-ink-3 font-medium truncate">{vendorName}</p>
        <h3 className="text-sm font-medium text-ink line-clamp-2 leading-snug">{name}</h3>

        {/* Prices */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1.5">
          <span className="price text-base font-bold text-ink">{formatNPR(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="price text-xs text-ink-3 line-through">{formatNPR(originalPrice)}</span>
          )}
        </div>

        {/* Savings chip */}
        {savings > 0 && (
          <p className="text-[11px] text-green-700 font-medium">
            You save {formatNPR(savings)}
          </p>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-gold' : 'text-line-soft'}`}
                  fill="currentColor" viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviewCount !== undefined && (
              <span className="text-[11px] text-ink-3">({reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
