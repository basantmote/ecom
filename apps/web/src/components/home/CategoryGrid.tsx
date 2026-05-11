import Link from 'next/link'

const CATEGORIES = [
  { slug: 'electronics', label: 'Electronics', icon: '📱' },
  { slug: 'fashion', label: 'Fashion', icon: '👗' },
  { slug: 'home-living', label: 'Home & Living', icon: '🏠' },
  { slug: 'beauty', label: 'Beauty', icon: '💄' },
  { slug: 'sports', label: 'Sports', icon: '⚽' },
  { slug: 'books', label: 'Books', icon: '📚' },
  { slug: 'groceries', label: 'Groceries', icon: '🛒' },
  { slug: 'toys', label: 'Toys & Kids', icon: '🧸' },
]

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="font-serif text-2xl font-bold text-ink mb-5">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="cat-tile">
            <span className="text-2xl" role="img" aria-label={cat.label}>
              {cat.icon}
            </span>
            <span className="text-xs font-medium text-ink-2 text-center leading-tight">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
