'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart.store'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

function attrLabel(attributes: Record<string, string>): string {
  return Object.values(attributes).join(' / ') || 'Default'
}

interface Variant {
  id: string
  sku: string
  attributes: Record<string, string>
  price: number
  comparePrice: number | null
  stock: number
  reservedStock: number
  images: string[]
}

interface Review {
  id: string
  rating: number
  body: string | null
  user: { profile: { fullName: string } | null }
}

interface ProductDetail {
  id: string
  vendorId: string
  name: string
  slug: string
  description: string | null
  variants: Variant[]
  vendor: { storeName: string }
  reviews: Review[]
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`)
      return res.data.data as ProductDetail
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="text-center py-24 text-ink-3">
        <p className="text-lg">Product not found.</p>
      </div>
    )
  }

  const activeVariant =
    (selectedVariantId ? product.variants.find((v) => v.id === selectedVariantId) : null) ??
    product.variants[0]

  const discount = activeVariant?.comparePrice
    ? Math.round((1 - activeVariant.price / activeVariant.comparePrice) * 100)
    : 0

  // Aggregate all variant images into a single gallery, deduplicated
  const allImages = Array.from(
    new Set(product.variants.flatMap((v) => v.images))
  )
  const galleryImages = allImages.length > 0
    ? allImages
    : ['https://placehold.co/600x600/ebe5d6/4a4239?text=Product']

  const availableStock = (activeVariant?.stock ?? 0) - (activeVariant?.reservedStock ?? 0)

  function handleAddToCart() {
    if (!activeVariant || !product) return
    addItem({
      variantId: activeVariant.id,
      productName: product.name,
      variantLabel: attrLabel(activeVariant.attributes),
      price: activeVariant.price,
      quantity: qty,
      image: galleryImages[0] ?? '',
      vendorId: product.vendorId,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null

  const safeImgIndex = Math.min(imgIndex, galleryImages.length - 1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-3 mb-6 flex items-center gap-1.5">
        <a href="/" className="hover:text-ink transition-colors">Home</a>
        <span>›</span>
        <a href="/products" className="hover:text-ink transition-colors">Products</a>
        <span>›</span>
        <span className="text-ink truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-paper-2 mb-3 shadow-card">
            <Image
              src={galleryImages[safeImgIndex] ?? ''}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discount >= 5 && (
              <div className="absolute top-3 left-3">
                <span className="badge bg-crimson text-white text-sm px-3 py-1">-{discount}%</span>
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-colors ${
                    i === safeImgIndex ? 'border-ink' : 'border-line-soft hover:border-ink-3'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <p className="text-sm text-ink-3 mb-1">{product.vendor.storeName}</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-3">{product.name}</h1>

          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-gold' : 'text-line-soft'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-ink-3">
                {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="price text-3xl font-bold text-ink">{formatNPR(activeVariant?.price ?? 0)}</span>
            {activeVariant?.comparePrice && (
              <span className="price text-lg text-ink-3 line-through">{formatNPR(activeVariant.comparePrice)}</span>
            )}
            {discount >= 5 && <Badge variant="crimson">Save {formatNPR(activeVariant!.comparePrice! - activeVariant!.price)}</Badge>}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-ink mb-2">Select Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const avail = v.stock - v.reservedStock
                  return (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariantId(v.id); setImgIndex(0) }}
                      disabled={avail <= 0}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                        v.id === activeVariant?.id
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line-soft text-ink-2 hover:border-ink-3'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {attrLabel(v.attributes)}
                      {avail <= 0 && <span className="ml-1 text-[10px]">(sold out)</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock badge */}
          {availableStock > 0 && availableStock <= 5 && (
            <p className="text-xs text-crimson font-medium mb-4">
              Only {availableStock} left in stock — order soon!
            </p>
          )}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center border-2 border-line-soft rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-11 flex items-center justify-center text-ink-2 hover:bg-paper-2 text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-mono font-bold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(availableStock, qty + 1))}
                disabled={qty >= availableStock}
                className="w-10 h-11 flex items-center justify-center text-ink-2 hover:bg-paper-2 text-lg font-bold transition-colors disabled:opacity-30"
              >
                +
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex-1"
              size="lg"
            >
              {added ? '✓ Added to cart' : availableStock <= 0 ? 'Out of stock' : `Add to cart · ${formatNPR((activeVariant?.price ?? 0) * qty)}`}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: '🚚', label: 'Free delivery', sub: 'orders over Rs.1000' },
              { icon: '↩️', label: 'Easy returns', sub: '7-day return policy' },
              { icon: '✅', label: 'Genuine product', sub: 'verified vendor' },
            ].map((b) => (
              <div key={b.label} className="text-center p-2 rounded-xl bg-paper-2">
                <p className="text-lg mb-0.5">{b.icon}</p>
                <p className="text-[10px] font-semibold text-ink">{b.label}</p>
                <p className="text-[9px] text-ink-3">{b.sub}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-line-soft pt-4">
              <p className="text-sm font-semibold text-ink mb-2">Description</p>
              <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mb-4">
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ink">
                    {r.user.profile?.fullName ?? 'Anonymous'}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-gold' : 'text-line-soft'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {r.body && <p className="text-sm text-ink-2 leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
