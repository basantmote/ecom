import Link from 'next/link'
import Image from 'next/image'

const COLLECTIONS = [
  {
    title: 'Tech Under Rs. 5,000',
    subtitle: 'Earbuds, chargers, cables & more',
    href: '/products?category=electronics&maxPrice=500000',
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop&auto=format&q=80',
    accent: 'from-blue-950/80 via-blue-900/40',
    badge: '500+ items',
  },
  {
    title: 'Nepali Brands',
    subtitle: 'Proudly made in Nepal',
    href: '/products?origin=nepal',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80',
    accent: 'from-crimson-deep/80 via-crimson/40',
    badge: 'Local favorites',
  },
  {
    title: 'Home Office Essentials',
    subtitle: 'Work from home in style',
    href: '/products?category=home-office',
    image: 'https://images.unsplash.com/photo-1593640408182-31c228ebae19?w=600&h=400&fit=crop&auto=format&q=80',
    accent: 'from-stone-950/80 via-stone-800/40',
    badge: 'WFH picks',
  },
]

export function Collections() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Curated Collections</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLLECTIONS.map((col) => (
          <Link
            key={col.href}
            href={col.href}
            className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
          >
            <Image
              src={col.image}
              alt={col.title}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${col.accent} to-transparent`} />

            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <span className="chip text-[10px] mb-2 w-fit border-white/20 bg-white/10 text-white/90">
                {col.badge}
              </span>
              <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1">
                {col.title}
              </h3>
              <p className="text-white/70 text-xs">{col.subtitle}</p>
            </div>

            {/* Arrow */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
