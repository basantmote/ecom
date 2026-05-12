'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useWishlistStore } from '@/store/wishlist.store'

function WishlistSync() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const load = useWishlistStore((s) => s.load)
  const clear = useWishlistStore((s) => s.clear)

  useEffect(() => {
    if (accessToken) load()
    else clear()
  }, [accessToken, load, clear])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <WishlistSync />
      {children}
    </QueryClientProvider>
  )
}
