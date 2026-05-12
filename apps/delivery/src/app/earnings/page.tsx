'use client'

import Link from 'next/link'

const DAILY = [
  { date: 'Mon 5 May', deliveries: 9, earned: 112500 },
  { date: 'Tue 6 May', deliveries: 7, earned: 87500 },
  { date: 'Wed 7 May', deliveries: 11, earned: 137500 },
  { date: 'Thu 8 May', deliveries: 6, earned: 75000 },
  { date: 'Fri 9 May', deliveries: 12, earned: 150000 },
  { date: 'Sat 10 May', deliveries: 8, earned: 100000 },
  { date: 'Sun 11 May', deliveries: 7, earned: 87500 },
]

const weekTotal = DAILY.reduce((s, d) => s + d.earned, 0)
const weekDeliveries = DAILY.reduce((s, d) => s + d.deliveries, 0)
const maxEarned = Math.max(...DAILY.map((d) => d.earned))

export default function EarningsPage() {
  return (
    <div className="min-h-screen bg-mesh-dark text-white pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-white font-semibold text-lg">Earnings</h1>
      </header>

      {/* Weekly summary */}
      <div className="mx-5 mb-5 card-dark p-5">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">This Week</p>
        <p className="font-mono text-3xl font-bold text-green-400">
          Rs. {(weekTotal / 100).toLocaleString('en-IN')}
        </p>
        <p className="text-white/50 text-sm mt-1">from {weekDeliveries} deliveries</p>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          {[
            { label: 'Avg/day', value: `Rs. ${Math.round(weekTotal / 700).toLocaleString('en-IN')}` },
            { label: 'Avg/trip', value: `Rs. ${Math.round(weekTotal / weekDeliveries / 100).toLocaleString('en-IN')}` },
            { label: 'Best day', value: 'Friday' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-mono font-bold text-white text-sm">{s.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="mx-5 mb-5 card-dark p-4">
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Daily Breakdown</p>
        <div className="flex items-end gap-2 h-28">
          {DAILY.map((d) => {
            const heightPct = (d.earned / maxEarned) * 100
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-green-500/80 transition-all" style={{ height: `${heightPct}%` }} />
                <span className="text-white/40 text-[9px]">{d.date.slice(0, 3)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily list */}
      <div className="mx-5 card-dark overflow-hidden">
        <p className="px-4 py-3 text-white/60 text-xs font-medium uppercase tracking-wider border-b border-white/8">
          Day-by-Day
        </p>
        {DAILY.map((d, i) => (
          <div key={d.date}
            className={`flex items-center justify-between px-4 py-3.5 ${i < DAILY.length - 1 ? 'border-b border-white/8' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{d.date}</p>
                <p className="text-white/50 text-xs">{d.deliveries} deliveries</p>
              </div>
            </div>
            <p className="font-mono font-bold text-green-400">+Rs. {(d.earned / 100).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ink border-t border-white/10 px-6 py-3 flex justify-around z-50">
        {[
          { key: 'home', label: 'Home', href: '/', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
          { key: 'deliveries', label: 'Deliveries', href: '/deliveries', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
          { key: 'earnings', label: 'Earnings', href: '/earnings', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
          { key: 'profile', label: 'Profile', href: '/profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
        ].map((item) => (
          <Link key={item.key} href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${item.key === 'earnings' ? 'text-crimson' : 'text-white/40'}`}>
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
