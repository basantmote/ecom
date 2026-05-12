'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// ─── Demo Data ────────────────────────────────────────────────────────────────

const revenueData = [
  { month: 'Jan', revenue: 120000000 },
  { month: 'Feb', revenue: 98000000 },
  { month: 'Mar', revenue: 145000000 },
  { month: 'Apr', revenue: 132000000 },
  { month: 'May', revenue: 178000000 },
  { month: 'Jun', revenue: 161000000 },
  { month: 'Jul', revenue: 184725000 },
]

const recentOrders = [
  { id: 'ORD-2841', customer: 'Priya Sharma', amount: 349500, status: 'DELIVERED', date: '11 May 2026' },
  { id: 'ORD-2840', customer: 'Ramesh Thapa', amount: 129900, status: 'SHIPPED', date: '11 May 2026' },
  { id: 'ORD-2839', customer: 'Sita Gurung', amount: 87500, status: 'CONFIRMED', date: '10 May 2026' },
  { id: 'ORD-2838', customer: 'Bikash KC', amount: 214000, status: 'PENDING', date: '10 May 2026' },
  { id: 'ORD-2837', customer: 'Anita Rai', amount: 59900, status: 'CANCELLED', date: '9 May 2026' },
]

const pendingVendors = [
  { name: 'Himalayan Crafts', category: 'Handicrafts', applied: '10 May 2026' },
  { name: 'Kathmandu Electronics', category: 'Electronics', applied: '9 May 2026' },
  { name: 'Nepal Organics', category: 'Food & Grocery', applied: '8 May 2026' },
  { name: 'Pokhara Textiles', category: 'Clothing', applied: '7 May 2026' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRs(paisa: number) {
  const rupees = paisa / 100
  return 'Rs. ' + rupees.toLocaleString('en-IN')
}

function formatRevenueK(paisa: number) {
  return (paisa / 10000000).toFixed(2) + 'L'
}

const statusColors: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  trend: string
  positive: boolean
  icon: React.ReactNode
  iconBg: string
}

function KpiCard({ label, value, trend, positive, icon, iconBg }: KpiCardProps) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <p className="text-sm text-ink-3 font-medium">{label}</p>
      <p className="font-mono text-2xl font-bold text-ink mt-1">{value}</p>
      <span className={`badge mt-3 ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trend}
      </span>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs">
        <p className="text-ink-3 font-medium">{label}</p>
        <p className="text-ink font-bold mt-0.5">{formatRevenueK(payload[0]?.value ?? 0)}</p>
      </div>
    )
  }
  return null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value="Rs. 18,47,250"
          trend="↑ +12.4% vs last month"
          positive
          iconBg="bg-crimson/10"
          icon={
            <svg className="w-5 h-5 text-crimson" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Total Orders"
          value="2,841"
          trend="↑ +8.2% vs last month"
          positive
          iconBg="bg-blue-50"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          }
        />
        <KpiCard
          label="Active Vendors"
          value="312"
          trend="↑ +24 new this month"
          positive
          iconBg="bg-gold/10"
          icon={
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
            </svg>
          }
        />
        <KpiCard
          label="Total Customers"
          value="14,830"
          trend="↑ +6.1% vs last month"
          positive
          iconBg="bg-green-50"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">Revenue Overview</h2>
            <p className="text-sm text-ink-3 mt-0.5">Last 7 months</p>
          </div>
          <span className="badge bg-green-100 text-green-700">↑ +12.4%</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="crimsonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9d2c2" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#8a8378' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatRevenueK(v)}
              tick={{ fontSize: 11, fill: '#8a8378' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#b91c1c"
              strokeWidth={2}
              fill="url(#crimsonGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#b91c1c', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Recent Orders */}
        <div className="card p-6 xl:col-span-3">
          <h2 className="font-serif text-lg font-bold text-ink mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Order</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Customer</th>
                  <th className="text-right py-2 pr-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 text-xs font-semibold text-ink-3 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-paper-2/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-ink-2">{order.id}</td>
                    <td className="py-3 pr-4 font-medium text-ink">{order.customer}</td>
                    <td className="py-3 pr-4 text-right font-mono text-sm text-ink">{formatRs(order.amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="py-3 text-ink-3 text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-ink">Pending Vendors</h2>
            <span className="badge bg-amber-100 text-amber-700">{pendingVendors.length} waiting</span>
          </div>
          <div className="space-y-3">
            {pendingVendors.map((vendor) => (
              <div key={vendor.name} className="flex items-center justify-between p-3 rounded-xl bg-paper-2 border border-line-soft">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{vendor.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{vendor.category} · {vendor.applied}</p>
                </div>
                <button className="btn-primary text-xs px-3 py-1.5 ml-3 shrink-0">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
