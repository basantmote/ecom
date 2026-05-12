import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = [
  {
    slug: 'electronics',
    label: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-blue-900/60',
  },
  {
    slug: 'fashion',
    label: 'Fashion',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-pink-900/60',
  },
  {
    slug: 'home-living',
    label: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-amber-900/60',
  },
  {
    slug: 'beauty',
    label: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-rose-900/60',
  },
  {
    slug: 'sports',
    label: 'Sports',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-green-900/60',
  },
  {
    slug: 'books',
    label: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-stone-900/60',
  },
  {
    slug: 'groceries',
    label: 'Groceries',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-lime-900/60',
  },
  {
    slug: 'toys',
    label: 'Toys & Kids',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=240&h=240&fit=crop&auto=format&q=70',
    color: 'from-purple-900/60',
  },
]

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Shop by Category</h2>
        <Link href="/products" className="text-sm text-crimson hover:underline font-medium">
          All categories →
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            {/* Background image */}
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              sizes="(max-width: 640px) 25vw, 12vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />

            {/* Label */}
            <div className="absolute inset-x-0 bottom-0 p-2">
              <p className="text-white text-[10px] sm:text-xs font-semibold text-center leading-tight drop-shadow">
                {cat.label}
              </p>
            </div>

            {/* Hover ring */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-crimson/40 transition-all duration-300" />
          </Link>
        ))}
      </div>
    </section>
  )
}
