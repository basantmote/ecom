import { create } from 'zustand'
import { api } from '@/lib/api'

interface WishlistState {
  productIds: string[]
  loaded: boolean
  load: () => Promise<void>
  add: (productId: string, variantId?: string) => Promise<void>
  remove: (productId: string) => Promise<void>
  toggle: (productId: string, variantId?: string) => Promise<void>
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  loaded: false,

  load: async () => {
    try {
      const res = await api.get('/users/me/wishlist')
      const items = res.data.data as Array<{ productId: string }>
      set({ productIds: items.map((i) => i.productId), loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  add: async (productId, variantId) => {
    set((s) => ({
      productIds: s.productIds.includes(productId) ? s.productIds : [...s.productIds, productId],
    }))
    try {
      await api.post('/users/me/wishlist', { productId, variantId })
    } catch {
      set((s) => ({ productIds: s.productIds.filter((id) => id !== productId) }))
    }
  },

  remove: async (productId) => {
    const prev = get().productIds
    set((s) => ({ productIds: s.productIds.filter((id) => id !== productId) }))
    try {
      await api.delete(`/users/me/wishlist/${productId}`)
    } catch {
      set({ productIds: prev })
    }
  },

  toggle: async (productId, variantId) => {
    if (get().has(productId)) {
      await get().remove(productId)
    } else {
      await get().add(productId, variantId)
    }
  },

  has: (productId) => get().productIds.includes(productId),

  clear: () => set({ productIds: [], loaded: false }),
}))
