'use client'

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const revenueMonthly = [
  { month: 'Dec', revenue: 18400000 },
  { month: 'Jan', revenue: 22100000 },
  { month: 'Feb', revenue: 19800000 },
  { month: 'Mar', revenue: 31200000 },
  { month: 'Apr', revenue: 27600000 },
  { month: 'May', revenue: 28475000 },
]

const ordersByCategory = [
  { cat: 'Phones', orders: 124 },
  { cat: 'Laptops', orders: 67 },
  { cat: 'Audio', orders: 89 },
  { cat: 'Accs.', orders: 201 },
  { cat: 'Wearables', orders: 45 },
]

const topProducts = [
  { name: 'Samsung Galaxy A55', revenue: 28219900, units: 34, growth: '+12%' },
  { name: 'Wireless Earbuds Pro', revenue: 31141100, units: 89, growth: '+28%' },
  { name: 'Mechanical Keyboard', revenue: 28594800, units: 52, growth: '+5%' },
  { name: 'USB-C Hub 7-in-1', revenue: 9494900, units: 50, growth: '+41%' },
  { name: 'Laptop Stand', revenue: 12494900, units: 50, growth: '-3%' },
]

function fmt(paisa: number) {
  return 'Rs. ' + (paisa / 100).toLocaleString('en-IN')
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-sm text-ink-3 mt-0.5">Store performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (May)', value: 'Rs. 2,84,750', change: '+8.2%', up: true },
          { label: 'Orders (May)', value: '341', change: '+14.1%', up: true },
          { label: 'Avg. Order Value', value: 'Rs. 835', change: '+5.7%', up: true },
          { label: 'Return Rate', value: '2.4%', change: '-0.8%', up: true },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-ink-3 font-medium">{k.label}</p>
            <p className="font-mono text-xl font-bold text-ink mt-1">{k.value}</p>
            <span className={`badge mt-2 text-[10px] ${k.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{k.change}</span>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">Revenue Trend</h2>
            <p className="text-sm text-ink-3 mt-0.5">Last 6 months</p>
          </div>
          <span className="badge bg-green-100 text-green-700">↑ +8.2%</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueMonthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9d2c2" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a8378' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => 'Rs.' + (v / 10000).toFixed(0) + 'k'} tick={{ fontSize: 11, fill: '#8a8378' }} axisLine={false} tickLine={false} width={52} />
            <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #d9d2c2', fontSize: '12px' }} />
            <Area type="monotone" dataKey="revenue" stroke="#b91c1c" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#b91c1c', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders by category */}
        <div className="card p-6">
          <h2 className="font-serif text-lg font-bold text-ink mb-5">Orders by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d2c2" vertical={false} />
              <XAxis dataKey="cat" tick={{ fontSize: 11, fill: '#8a8378' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8378' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #d9d2c2', fontSize: '12px' }} />
              <Bar dataKey="orders" fill="#c98a2b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h2 className="font-serif text-lg font-bold text-ink mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-paper-2 flex items-center justify-center text-xs font-bold text-ink-2 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-ink-3">{p.units} units</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold text-ink">{fmt(p.revenue)}</p>
                  <span className={`text-[10px] font-medium ${p.growth.startsWith('+') ? 'text-green-600' : 'text-crimson'}`}>{p.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
