'use client'

import Link from 'next/link'

interface PastDelivery {
  id: string
  orderId: string
  customer: string
  deliveryAddress: string
  amount: number
  date: string
  time: string
  duration: string
}

const PAST_DELIVERIES: PastDelivery[] = [
  {
    id: 'DEL-090',
    orderId: 'ORD-8820',
    customer: 'Hari Prasad',
    deliveryAddress: 'Thamel, Kathmandu',
    amount: 34500,
    date: 'Today',
    time: '11:32 AM',
    duration: '22 min',
  },
  {
    id: 'DEL-089',
    orderId: 'ORD-8815',
    customer: 'Anita Gurung',
    deliveryAddress: 'Patan, Lalitpur',
    amount: 18750,
    date: 'Today',
    time: '10:05 AM',
    duration: '31 min',
  },
  {
    id: 'DEL-088',
    orderId: 'ORD-8802',
    customer: 'Bikash Shrestha',
    deliveryAddress: 'Chabahil, Kathmandu',
    amount: 55000,
    date: 'Yesterday',
    time: '7:48 PM',
    duration: '19 min',
  },
  {
    id: 'DEL-087',
    orderId: 'ORD-8799',
    customer: 'Priya Maharjan',
    deliveryAddress: 'Bhaktapur, Ward 5',
    amount: 92000,
    date: 'Yesterday',
    time: '5:20 PM',
    duration: '45 min',
  },
  {
    id: 'DEL-086',
    orderId: 'ORD-8791',
    customer: 'Rajan KC',
    deliveryAddress: 'Koteshwor, Kathmandu',
    amount: 12500,
    date: 'Yesterday',
    time: '3:10 PM',
    duration: '14 min',
  },
  {
    id: 'DEL-085',
    orderId: 'ORD-8780',
    customer: 'Mina Tamang',
    deliveryAddress: 'Kirtipur, Ward 3',
    amount: 43000,
    date: 'May 9',
    time: '6:55 PM',
    duration: '28 min',
  },
  {
    id: 'DEL-084',
    orderId: 'ORD-8765',
    customer: 'Suresh Pandey',
    deliveryAddress: 'Bouddha, Kathmandu',
    amount: 28000,
    date: 'May 9',
    time: '4:30 PM',
    duration: '17 min',
  },
  {
    id: 'DEL-083',
    orderId: 'ORD-8754',
    customer: 'Kamala Devi',
    deliveryAddress: 'Imadol, Lalitpur',
    amount: 67500,
    date: 'May 9',
    time: '1:45 PM',
    duration: '38 min',
  },
  {
    id: 'DEL-082',
    orderId: 'ORD-8741',
    customer: 'Dipesh Ghimire',
    deliveryAddress: 'Balkhu, Kathmandu',
    amount: 21000,
    date: 'May 8',
    time: '8:20 PM',
    duration: '20 min',
  },
  {
    id: 'DEL-081',
    orderId: 'ORD-8730',
    customer: 'Nisha Rai',
    deliveryAddress: 'Maharajgunj, Kathmandu',
    amount: 53250,
    date: 'May 8',
    time: '5:00 PM',
    duration: '25 min',
  },
]

const WEEK_EARNINGS = {
  total: 425000,
  count: 24,
  today: 87500,
  yesterday: 110000,
  avg: 60357,
}

function BottomNav({ active }: { active: 'home' | 'deliveries' | 'earnings' | 'profile' }) {
  const items = [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key: 'deliveries',
      label: 'Deliveries',
      href: '/deliveries',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'earnings',
      label: 'Earnings',
      href: '/earnings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ] as const

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ink border-t border-white/10 px-6 py-3 flex justify-around z-50">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`flex flex-col items-center gap-1 transition-colors ${
            active === item.key ? 'text-crimson' : 'text-white/40'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default function DeliveriesPage() {
  return (
    <div className="min-h-screen bg-mesh-dark text-white pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/15 transition-colors shrink-0"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-white text-lg font-bold">Delivery History</h1>
      </header>

      {/* Earnings summary card */}
      <div className="mx-5 mb-4 card-dark p-5">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
          This Week
        </p>
        <p className="font-mono text-3xl font-bold text-green-400">
          Rs. {Math.floor(WEEK_EARNINGS.total / 100).toLocaleString()}
        </p>
        <p className="text-white/50 text-xs mt-1">
          from {WEEK_EARNINGS.count} deliveries
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/8">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Today</p>
            <p className="text-white font-mono font-semibold text-sm mt-0.5">
              Rs. {Math.floor(WEEK_EARNINGS.today / 100)}
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Yesterday</p>
            <p className="text-white font-mono font-semibold text-sm mt-0.5">
              Rs. {Math.floor(WEEK_EARNINGS.yesterday / 100).toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Avg / day</p>
            <p className="text-white font-mono font-semibold text-sm mt-0.5">
              Rs. {Math.floor(WEEK_EARNINGS.avg / 100)}
            </p>
          </div>
        </div>
      </div>

      {/* List heading */}
      <p className="px-5 mb-3 text-white/60 text-xs font-semibold uppercase tracking-widest">
        Past Deliveries
      </p>

      {/* Delivery items */}
      <div className="px-5 flex flex-col gap-2">
        {PAST_DELIVERIES.map((delivery) => (
          <div key={delivery.id} className="card-dark p-4 flex items-center gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-400"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white font-medium text-sm">{delivery.orderId}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/50 text-xs">{delivery.customer}</span>
              </div>
              <p className="text-white/40 text-xs truncate">{delivery.deliveryAddress}</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {delivery.date} at {delivery.time} · {delivery.duration}
              </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <p className="font-mono text-green-400 font-bold text-sm">
                Rs. {Math.floor(delivery.amount / 100)}
              </p>
              <span className="badge bg-green-500/15 text-green-400 text-[9px] mt-1">
                DELIVERED
              </span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="deliveries" />
    </div>
  )
}
