'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth.store'

interface Assignment {
  id: string
  status: 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'FAILED'
  assignedAt: string
  acceptedAt: string | null
  pickedAt: string | null
  deliveredAt: string | null
  order: {
    id: string
    total: number
    paymentMethod: string
    deliveryAddress: {
      street: string
      city: string
      recipientName: string
      recipientPhone: string
    }
    items: { quantity: number; variant: { product: { name: string } } }[]
    customer: { phone: string | null; profile: { fullName: string } | null }
  }
}

function formatNPR(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-NP')
}

const STATUS_COLOR: Record<string, string> = {
  ASSIGNED: 'bg-amber-400/20 text-amber-300',
  ACCEPTED: 'bg-blue-400/20 text-blue-300',
  PICKED_UP: 'bg-purple-400/20 text-purple-300',
  DELIVERED: 'bg-green-400/20 text-green-300',
  FAILED: 'bg-red-400/20 text-red-300',
}

export default function DashboardPage() {
  const router = useRouter()
  const { userId, accessToken, refreshToken, logout } = useAuthStore()
  const qc = useQueryClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !userId) router.replace('/login')
  }, [mounted, userId, router])

  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await api.get('/delivery/assignments')
      return res.data.data as Assignment[]
    },
    enabled: !!userId,
    refetchInterval: 30000, // poll every 30s for new assignments
  })

  const accept = useMutation({
    mutationFn: (id: string) => api.post(`/delivery/assignments/${id}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post(`/delivery/assignments/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  })

  async function handleLogout() {
    try {
      await api.post('/auth/logout', { refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch { /* proceed */ }
    localStorage.removeItem('delivery-accessToken')
    localStorage.removeItem('delivery-refreshToken')
    logout()
    router.push('/login')
  }

  if (!mounted || !userId) return null

  const assignments = data ?? []
  const active = assignments.filter((a) => !['DELIVERED', 'FAILED'].includes(a.status))
  const completed = assignments.filter((a) => ['DELIVERED', 'FAILED'].includes(a.status))

  return (
    <main className="min-h-screen bg-mesh-dark text-white">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm tracking-widest uppercase">हाम्रोBazaar</p>
          <h1 className="font-serif text-2xl font-bold mt-0.5">My Deliveries</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-white/50 hover:text-white text-sm transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="px-5 pb-10 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-40" />
            ))}
          </div>
        ) : active.length === 0 && completed.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛵</div>
            <p className="text-white/50">No assignments yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Active assignments */}
            {active.length > 0 && (
              <section>
                <h2 className="text-white/50 text-xs font-medium tracking-widest uppercase mb-3">
                  Active ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((a) => (
                    <div key={a.id} className="rounded-2xl bg-white/8 border border-white/10 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-xs text-white/40 mb-0.5">
                            #{a.order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="font-semibold">
                            {a.order.items.map((i) => i.variant.product.name).join(', ')}
                          </p>
                          <p className="text-white/50 text-sm mt-0.5">
                            {a.order.items.reduce((s, i) => s + i.quantity, 0)} item(s) · {formatNPR(a.order.total)}
                            {a.order.paymentMethod === 'COD' && <span className="text-amber-400 ml-1">(COD)</span>}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[a.status]}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-3 mb-3 text-sm">
                        <p className="text-white/50 text-xs mb-1">Deliver to</p>
                        <p className="font-medium">{a.order.deliveryAddress.recipientName}</p>
                        <p className="text-white/60">{a.order.deliveryAddress.street}, {a.order.deliveryAddress.city}</p>
                        <p className="text-white/50 text-xs mt-1">{a.order.deliveryAddress.recipientPhone}</p>
                      </div>

                      <div className="flex gap-2">
                        {a.status === 'ASSIGNED' && (
                          <button
                            onClick={() => accept.mutate(a.id)}
                            disabled={accept.isPending}
                            className="flex-1 bg-crimson hover:bg-crimson/80 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            Accept Delivery
                          </button>
                        )}
                        {a.status === 'ACCEPTED' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: a.id, status: 'PICKED_UP' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {a.status === 'PICKED_UP' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: a.id, status: 'DELIVERED' })}
                            disabled={updateStatus.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-white/50 text-xs font-medium tracking-widest uppercase mb-3">
                  Completed ({completed.length})
                </h2>
                <div className="space-y-2">
                  {completed.slice(0, 10).map((a) => (
                    <div key={a.id} className="rounded-xl bg-white/5 border border-white/8 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {a.order.items[0]?.variant.product.name}
                          {a.order.items.length > 1 && ` +${a.order.items.length - 1}`}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {a.deliveredAt ? new Date(a.deliveredAt).toLocaleDateString('en-NP') : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{formatNPR(a.order.total)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status]}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
