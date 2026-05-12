'use client'

import Link from 'next/link'

const STATS = [
  { label: 'Total Deliveries', value: '1,247' },
  { label: 'This Month', value: '84' },
  { label: 'Avg. Rating', value: '4.9★' },
  { label: 'Total Earned', value: 'Rs. 62,480' },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-mesh-dark text-white pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-white font-semibold text-lg">My Profile</h1>
      </header>

      {/* Profile card */}
      <div className="mx-5 mb-5 card-dark p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-crimson/20 flex items-center justify-center text-2xl font-bold text-crimson shrink-0">
            RB
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Rajesh Bahadur</h2>
            <p className="text-white/50 text-sm">+977-9841234567</p>
            <span className="badge bg-green-500/15 text-green-400 text-[10px] mt-1">● Active Partner</span>
          </div>
        </div>
        <button className="btn-ghost-dark w-full text-sm py-2.5">Edit Profile</button>
      </div>

      {/* Stats */}
      <div className="mx-5 mb-5 card-dark p-4">
        <p className="text-white/60 text-xs font-medium mb-3 uppercase tracking-wider">Lifetime Stats</p>
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-xl font-bold text-white">{s.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle info */}
      <div className="mx-5 mb-5 card-dark p-4 space-y-3">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Vehicle</p>
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Type</span>
          <span className="text-white text-sm font-medium">Motorcycle 🛵</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Plate Number</span>
          <span className="text-white font-mono text-sm">BA 01 PA 4521</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">License</span>
          <span className="badge bg-green-500/15 text-green-400 text-xs">Verified ✓</span>
        </div>
      </div>

      {/* Menu items */}
      <div className="mx-5 card-dark overflow-hidden">
        {[
          { label: 'Documents & KYC', icon: '📄' },
          { label: 'Bank / eSewa Account', icon: '💳' },
          { label: 'Help & Support', icon: '🆘' },
          { label: 'Log Out', icon: '🚪', danger: true },
        ].map((item, i, arr) => (
          <button key={item.label}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors
              ${item.danger ? 'text-crimson hover:bg-crimson/10' : 'text-white/80 hover:bg-white/8'}
              ${i < arr.length - 1 ? 'border-b border-white/8' : ''}`}
          >
            <span className="flex items-center gap-3">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {!item.danger && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ink border-t border-white/10 px-6 py-3 flex justify-around z-50">
        {[
          { key: 'home', label: 'Home', href: '/', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
          { key: 'deliveries', label: 'Deliveries', href: '/deliveries', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
          { key: 'earnings', label: 'Earnings', href: '/earnings', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
          { key: 'profile', label: 'Profile', href: '/profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
        ].map((item) => (
          <Link key={item.key} href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${item.key === 'profile' ? 'text-crimson' : 'text-white/40'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
