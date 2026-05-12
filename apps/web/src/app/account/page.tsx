'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { useWishlistStore } from '@/store/wishlist.store'
import { useAuthStore } from '@/store/auth.store'

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses'

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-paper-3 text-ink-3',
}

const STATUS_LABELS: Record<string, string> = {
  DELIVERED: 'Delivered',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
}

function fmt(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

interface UserProfile {
  id: string
  email: string
  createdAt: string
  profile: { fullName: string; phone: string | null } | null
  credits: { balance: number } | null
}

interface OrderItem {
  variant: {
    images: string[]
    product: { name: string }
  }
}

interface Order {
  id: string
  orderNumber: string | null
  status: string
  createdAt: string
  total: number
  items: OrderItem[]
}

interface WishlistProduct {
  id: string
  name: string
  slug: string
  variants: Array<{ price: number; images: string[] }>
  vendor: { storeName: string }
}

interface WishlistEntry {
  productId: string
  product: WishlistProduct
}

interface UserAddress {
  id: string
  label: string
  recipientName: string
  addressLine1: string
  addressLine2: string | null
  city: string
  phone: string
  isDefault: boolean
}

function AccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? 'profile')
  const [saved, setSaved] = useState(false)
  const queryClient = useQueryClient()
  const clearWishlist = useWishlistStore((s) => s.clear)
  const { accessToken, refreshToken, logout } = useAuthStore()

  async function handleLogout() {
    try {
      await api.post('/auth/logout', { refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    } catch { /* proceed even if API call fails */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    logout()
    clearWishlist()
    router.push('/')
  }

  useEffect(() => {
    if (tabParam && ['profile', 'orders', 'wishlist', 'addresses'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  const removeFromStore = useWishlistStore((s) => s.remove)

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data.data as UserProfile
    },
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/users/me/orders', { params: { limit: 20 } })
      return res.data.data as Order[]
    },
    enabled: activeTab === 'orders',
  })

  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: async () => {
      const res = await api.get('/users/me/wishlist')
      return res.data.data as WishlistEntry[]
    },
    enabled: activeTab === 'wishlist',
  })

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: async () => {
      const res = await api.get('/users/me/addresses')
      return res.data.data as UserAddress[]
    },
    enabled: activeTab === 'addresses',
  })

  const removeWishlistMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/users/me/wishlist/${productId}`),
    onMutate: (productId) => {
      removeFromStore(productId)
      queryClient.setQueryData(['my-wishlist'], (old: WishlistEntry[] | undefined) =>
        old?.filter((i) => i.productId !== productId) ?? [],
      )
    },
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'Orders' },
    { key: 'wishlist', label: 'Wishlist' },
    { key: 'addresses', label: 'Addresses' },
  ]

  const displayName = user?.profile?.fullName ?? user?.email?.split('@')[0] ?? '…'
  const initial = displayName[0]?.toUpperCase() ?? '?'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })
    : '…'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center text-paper font-serif text-2xl font-bold shrink-0">
          {userLoading ? '…' : initial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-bold text-ink">
            {userLoading ? <span className="inline-block w-40 h-6 bg-paper-3 rounded animate-pulse" /> : displayName}
          </h1>
          <p className="text-sm text-ink-3 mt-0.5">
            {userLoading ? '' : `${user?.email} · Member since ${memberSince}`}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost text-sm text-ink-3 hover:text-crimson flex items-center gap-1.5 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line-soft mb-8 gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative
              ${activeTab === t.key ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
          >
            {t.label}
            {activeTab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-crimson rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-ink mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Full Name</label>
                <input type="text" defaultValue={user?.profile?.fullName ?? ''} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Email</label>
                <input type="email" defaultValue={user?.email ?? ''} className="input-field" readOnly />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Phone</label>
                <input type="tel" defaultValue={user?.profile?.phone ?? ''} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
                className="btn-primary px-6"
              >
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-ink mb-5">Change Password</h2>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Confirm Password</label>
                <input type="password" placeholder="••••••••" className="input-field" />
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button className="btn-secondary px-6">Update Password</button>
            </div>
          </div>

          <div className="card p-6 border-red-100 bg-red-50/50">
            <h2 className="font-semibold text-ink mb-1">Danger Zone</h2>
            <p className="text-xs text-ink-3 mb-4">Permanently delete your account and all associated data.</p>
            <button className="btn-ghost text-crimson border-crimson/30 hover:bg-crimson/5 text-sm py-2 px-4">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Orders tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {ordersLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="w-6 h-6" />
            </div>
          ) : !ordersData?.length ? (
            <div className="text-center py-16 text-ink-3">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium">No orders yet</p>
              <Link href="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
            </div>
          ) : (
            ordersData.map((order) => {
              const thumb = order.items[0]?.variant?.images?.[0]
              const date = new Date(order.createdAt).toLocaleDateString('en-NP', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <div key={order.id} className="card p-4 flex items-center gap-4">
                  {thumb ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-paper-2">
                      <Image src={thumb} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-paper-3 shrink-0 flex items-center justify-center text-ink-3 text-xs">
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono text-sm font-semibold text-ink">
                        {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
                      </p>
                      <span className={`badge text-[10px] ${STATUS_COLORS[order.status] ?? 'bg-paper-3 text-ink-3'}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="text-xs text-ink-3 mt-0.5">
                      {date} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-mono text-sm font-bold text-ink mt-1">{fmt(order.total)}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="btn-ghost text-xs py-1.5 px-3 shrink-0"
                  >
                    View
                  </Link>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-3">
          {wishlistLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="w-6 h-6" />
            </div>
          ) : !wishlistData?.length ? (
            <div className="text-center py-16 text-ink-3">
              <p className="text-4xl mb-3">🤍</p>
              <p className="font-medium">Your wishlist is empty</p>
              <Link href="/products" className="btn-primary mt-4 inline-flex">Browse Products</Link>
            </div>
          ) : (
            wishlistData.map((item) => {
              const variant = item.product.variants[0]
              const img = variant?.images?.[0]
              return (
                <div key={item.productId} className="card p-4 flex items-center gap-4">
                  {img ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-paper-2">
                      <Image src={img} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-paper-3 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.product.name}</p>
                    <p className="text-xs text-ink-3 mt-0.5">{item.product.vendor.storeName}</p>
                    {variant && (
                      <p className="font-mono text-sm font-bold text-ink mt-1">{fmt(variant.price)}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/products/${item.product.slug}`} className="btn-primary text-xs py-1.5 px-3">
                      View
                    </Link>
                    <button
                      onClick={() => removeWishlistMutation.mutate(item.productId)}
                      disabled={removeWishlistMutation.isPending}
                      className="btn-ghost text-xs py-1.5 px-3 text-crimson"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Addresses tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          {addressesLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="w-6 h-6" />
            </div>
          ) : (
            <>
              {(addresses ?? []).map((addr) => (
                <div key={addr.id} className={`card p-5 ${addr.isDefault ? 'border-ink' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge bg-paper-2 text-ink-2 text-xs">{addr.label}</span>
                      {addr.isDefault && <span className="badge bg-ink text-paper text-[10px]">Default</span>}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-ghost text-xs py-1 px-2.5">Edit</button>
                      {!addr.isDefault && (
                        <button className="btn-ghost text-xs py-1 px-2.5 text-crimson">Remove</button>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-ink text-sm">{addr.recipientName}</p>
                  <p className="text-xs text-ink-3 mt-1">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-xs text-ink-3">{addr.addressLine2}</p>}
                  <p className="text-xs text-ink-3">{addr.city}</p>
                  <p className="text-xs text-ink-3 mt-1">{addr.phone}</p>
                  {!addr.isDefault && (
                    <button className="text-xs text-ink-2 underline mt-2 hover:text-ink transition-colors">
                      Set as default
                    </button>
                  )}
                </div>
              ))}
              {!addresses?.length && (
                <p className="text-center text-sm text-ink-3 py-8">No saved addresses yet.</p>
              )}
              <button className="w-full card p-5 border-dashed flex items-center justify-center gap-2 text-sm text-ink-3 hover:text-ink hover:border-ink transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Address
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>}>
      <AccountContent />
    </Suspense>
  )
}
