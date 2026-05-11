'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/home/ProductCard'
import { Spinner } from '@/components/ui/Spinner'

interface ProductVariant {
  id: string
  price: number
  comparePrice: number | null
}

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  variants: ProductVariant[]
  vendor: { storeName: string }
}

function formatCardProps(p: Product): React.ComponentProps<typeof ProductCard> {
  const variant = p.variants[0]
  return {
    slug: p.slug,
    name: p.name,
    vendorName: p.vendor.storeName,
    price: variant?.price ?? 0,
    originalPrice: variant?.comparePrice ?? undefined,
    imageUrl: p.images[0] ?? 'https://placehold.co/400x400/ebe5d6/4a4239?text=Product',
  }
}

function ProductGrid() {
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', q, category],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          search: q || undefined,
          category: category || undefined,
          limit: 48,
        },
      })
      return res.data.data as Product[]
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-24 text-ink-3">
        <p className="text-lg">Failed to load products.</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-24 text-ink-3">
        <p className="text-lg">No products found.</p>
        {q && <p className="text-sm mt-1">Try a different search term.</p>}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((p) => (
        <ProductCard key={p.id} {...formatCardProps(p)} />
      ))}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold text-ink mb-6">Products</h1>
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Spinner className="w-8 h-8" />
          </div>
        }
      >
        <ProductGrid />
      </Suspense>
    </div>
  )
}
