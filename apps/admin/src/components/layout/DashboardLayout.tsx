'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/vendors': 'Vendors',
  '/orders': 'Orders',
  '/users': 'Users',
  '/flash-sales': 'Flash Sales',
  '/coupons': 'Coupons',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const [key, title] of Object.entries(pageTitles)) {
    if (key !== '/' && pathname.startsWith(key)) return title
  }
  return 'Admin'
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, role } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && (!userId || role !== 'ADMIN')) {
      router.replace('/login')
    }
  }, [mounted, userId, role, router])

  if (!mounted) return null
  if (!userId || role !== 'ADMIN') return null

  const title = getPageTitle(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-mesh-warm">
      <Sidebar pathname={pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
