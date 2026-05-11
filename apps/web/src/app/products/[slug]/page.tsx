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

interface Variant {
  id: string
  label: string
  price: number
  comparePrice: number | null
  stock: number
}

interface Review {
  id: string
  rating: number
  comment: string
  user: { profile: { fullName: string } | null }
}

interface ProductDetail {
  id: string
  name: string
  slug: string
  description: string
  images: string[]
  variants: Variant[]
  vendor: { id: string; storeName: string }
  reviews: Review[]
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
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

  const activeVariantId = selectedVariant ?? product.variants[0]?.id
  const variant = product.variants.find((v) => v.id === activeVariantId) ?? product.variants[0]
  const discount = variant?.comparePrice ? Math.round((1 - variant.price / variant.comparePrice) * 100) : 0

  function handleAddToCart() {
    if (!variant || !product) return
    addItem({
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label,
      price: variant.price,
      quantity: qty,
      image: product.images[0] ?? '',
      vendorId: product.vendor.id,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden bg-paper-2 mb-3">
            <Image
              src={product.images[imgIndex] ?? 'https://placehold.co/600x600/ebe5d6/4a4239?text=Product'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`relative w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 transition-colors ${
                    i === imgIndex ? 'border-ink' : 'border-line-soft'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-ink-3 mb-1">{product.vendor.storeName}</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-3">{product.name}</h1>

          {avgRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold">{'★'.repeat(Math.round(avgRating))}</span>
              <span className="text-sm text-ink-3">
                {avgRating.toFixed(1)} ({product.reviews.length} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="price text-3xl font-bold text-ink">{formatNPR(variant?.price ?? 0)}</span>
            {variant?.comparePrice && (
              <span className="price text-lg text-ink-3 line-through">{formatNPR(variant.comparePrice)}</span>
            )}
            {discount >= 5 && <Badge variant="crimson">-{discount}%</Badge>}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-ink mb-2">Select variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    disabled={v.stock === 0}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      v.id === activeVariantId
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line-soft text-ink-2 hover:border-ink'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-line-soft rounded">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 flex items-center justify-center text-ink-2 hover:bg-paper-2"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-mono">{qty}</span>
              <button
                onClick={() => setQty(Math.min((variant?.stock ?? 99), qty + 1))}
                className="w-9 h-9 flex items-center justify-center text-ink-2 hover:bg-paper-2"
              >
                +
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!variant || variant.stock === 0}
              className="flex-1"
              size="lg"
            >
              {added ? '✓ Added to cart' : variant?.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </Button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-line-soft pt-5">
              <p className="text-sm font-medium text-ink mb-2">Description</p>
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
                  <span className="text-gold text-sm">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-ink-2 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
