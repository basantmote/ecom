'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const revenueData = [
  { day: 'Mon', revenue: 28400 },
  { day: 'Tue', revenue: 42100 },
  { day: 'Wed', revenue: 35700 },
  { day: 'Thu', revenue: 61200 },
  { day: 'Fri', revenue: 55800 },
  { day: 'Sat', revenue: 73400 },
  { day: 'Sun', revenue: 48900 },
]

const recentOrders = [
  { id: '#ORD-4821', product: 'Samsung Galaxy A55', amount: 8299900, status: 'DELIVERED', date: 'May 10' },
  { id: '#ORD-4820', product: 'Wireless Earbuds Pro', amount: 349900, status: 'SHIPPED', date: 'May 10' },
  { id: '#ORD-4819', product: 'USB-C Hub 7-in-1', amount: 189900, status: 'CONFIRMED', date: 'May 9' },
  { id: '#ORD-4818', product: 'Mechanical Keyboard', amount: 549900, status: 'PENDING', date: 'May 9' },
  { id: '#ORD-4817', product: 'Laptop Stand Aluminium', amount: 249900, status: 'CANCELLED', date: 'May 8' },
]

const topProducts = [
  { rank: 1, name: 'Samsung Galaxy A55', category: 'Electronics', units: 34, revenue: 282196600 },
  { rank: 2, name: 'Wireless Earbuds Pro', category: 'Electronics', units: 89, revenue: 31141100 },
  { rank: 3, name: 'Mechanical Keyboard', category: 'Accessories', units: 52, revenue: 28594800 },
]

const statusColors: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-paper-3 text-ink-2',
  CANCELLED: 'bg-red-100 text-red-600',
}

const kpis = [
  {
    label: 'Total Revenue',
    value: 'Rs. 2,84,750',
    sub: 'this month',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'Orders',
    value: '341',
    sub: 'this month',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Products',
    value: '48',
    sub: 'listed',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Pending Settlement',
    value: 'Rs. 18,420',
    sub: 'awaiting payout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

function formatPaisa(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-IN')
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">Good morning, TechHub Nepal</h2>
        <p className="text-ink-3 text-sm mt-0.5">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Settlement banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">You have Rs. 18,420 pending settlement</p>
            <p className="text-xs text-amber-600 mt-0.5">Settlements are processed every Monday.</p>
          </div>
        </div>
        <button className="btn-secondary text-amber-700 border-amber-400 hover:bg-amber-100 hover:text-amber-800 shrink-0">
          Request Payout
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">{kpi.label}</p>
                <p className="font-mono text-2xl font-bold text-ink mt-1">{kpi.value}</p>
                <p className="text-xs text-ink-3 mt-0.5">{kpi.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-5 xl:col-span-2">
          <h3 className="font-semibold text-ink text-sm mb-4">Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d2c2" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#8a8378' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#8a8378' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Rs.${(v / 100).toLocaleString('en-IN')}`}
                width={65}
              />
              <Tooltip
                formatter={(value: number) => [`Rs. ${(value / 100).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{
                  background: '#fdfbf7',
                  border: '1px solid #d9d2c2',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#b91c1c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink text-sm mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((p) => (
              <div key={p.rank} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-crimson/10 text-crimson text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {p.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{p.category} · {p.units} units sold</p>
                  <p className="font-mono text-xs text-crimson font-semibold mt-0.5">
                    {formatPaisa(p.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink text-sm">Recent Orders</h3>
          <a href="/orders" className="text-xs text-crimson font-medium hover:text-crimson-deep transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line-soft">
                {['Order ID', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs text-ink-3 font-medium pb-2.5 pr-4 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-paper-2/50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-ink-2">{order.id}</td>
                  <td className="py-3 pr-4 text-ink font-medium">{order.product}</td>
                  <td className="py-3 pr-4 font-mono text-sm text-crimson font-semibold">
                    {formatPaisa(order.amount)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="py-3 text-xs text-ink-3">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
