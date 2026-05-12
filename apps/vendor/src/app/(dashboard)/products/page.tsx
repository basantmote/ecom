'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Variant {
  id: string
  price: number
  stock: number
  isActive: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  category: { name: string }
  variants: Variant[]
  createdAt: string
}

function formatNPR(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

const STATUS_STYLES = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-paper-3 text-ink-2',
  ARCHIVED: 'bg-red-100 text-red-600',
}

export default function ProductsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const res = await api.get('/vendor/products')
      return res.data.data as Product[]
    },
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/vendor/products/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-products'] }),
  })

  const products = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">Products</h2>
          <p className="text-sm text-ink-3 mt-0.5">{products.length} products in your store</p>
        </div>
        <Link href="/products/new" className="btn-primary text-sm gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-16 bg-paper-2" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-3 mb-4">No products yet. Add your first product.</p>
          <Link href="/products/new" className="btn-primary text-sm">Add Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-2 border-b border-line-soft">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-ink-2">Product</th>
                <th className="text-left px-4 py-3 font-medium text-ink-2">Category</th>
                <th className="text-right px-4 py-3 font-medium text-ink-2">Price</th>
                <th className="text-right px-4 py-3 font-medium text-ink-2">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-ink-2">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {products.map((p) => {
                const minPrice = Math.min(...p.variants.map((v) => v.price))
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
                return (
                  <tr key={p.id} className="hover:bg-paper-2/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-ink-3">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-ink">
                      {p.variants.length > 0 ? formatNPR(minPrice) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-ink-2">{totalStock}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus.mutate({
                            id: p.id,
                            status: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
                          })}
                          disabled={toggleStatus.isPending}
                          className="text-xs text-ink-3 hover:text-ink border border-line-soft hover:border-ink-3 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {p.status === 'ACTIVE' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="text-xs text-crimson hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
