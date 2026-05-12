'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/products/new': 'Add Product',
  '/orders': 'Orders',
  '/analytics': 'Analytics',
  '/flash-sales': 'Flash Sales',
  '/payouts': 'Payouts',
  '/settings': 'Settings',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'products' && segments.length > 1) return 'Product Details'
  if (segments[0] === 'orders' && segments.length > 1) return 'Order Details'
  return 'Vendor Portal'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, role } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && (!userId || role !== 'VENDOR')) {
      router.replace('/login')
    }
  }, [mounted, userId, role, router])

  if (!mounted) return null
  if (!userId || role !== 'VENDOR') return null

  const title = getTitle(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-mesh-warm">
      <Sidebar pathname={pathname} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
