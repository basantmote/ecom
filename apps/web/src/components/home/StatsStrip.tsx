const STATS = [
  { icon: '🏪', value: '2,000+', label: 'Verified Vendors' },
  { icon: '📦', value: '50,000+', label: 'Products Listed' },
  { icon: '🚚', value: '77', label: 'Districts Delivered' },
  { icon: '⭐', value: '4.8 / 5', label: 'Avg. Customer Rating' },
  { icon: '🔄', value: '7-Day', label: 'Easy Returns' },
  { icon: '💳', value: '3+', label: 'Payment Methods' },
]

export function StatsStrip() {
  return (
    <section className="bg-paper-2 border-y border-line-soft">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-mono font-bold text-lg text-ink">{s.value}</p>
              <p className="text-xs text-ink-3 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
