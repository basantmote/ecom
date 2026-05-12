'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/home/ProductCard'

interface FlashDeal {
  id: string
  slug: string
  name: string
  vendorName: string
  vendorId: string
  variantId: string
  price: number
  originalPrice: number
  imageUrl: string
  rating: number
  reviewCount: number
  category: string
  stock: number
  stockLeft: number
  endsAtMs: number
}

const FLASH_DEALS: FlashDeal[] = [
  {
    id: '1', slug: 'samsung-galaxy-a55-5g', name: 'Samsung Galaxy A55 5G',
    vendorName: 'TechHub Nepal', vendorId: 'v1', variantId: 'var1',
    price: 4124900, originalPrice: 5499900,
    imageUrl: 'https://placehold.co/400x400/1a1410/fdfbf7?text=Galaxy+A55',
    rating: 4.6, reviewCount: 312, category: 'Phones',
    stock: 10, stockLeft: 3,
    endsAtMs: Date.now() + 4 * 3600 * 1000 + 27 * 60 * 1000,
  },
  {
    id: '2', slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5 Headphones',
    vendorName: 'Sound Merchants', vendorId: 'v2', variantId: 'var2',
    price: 3149900, originalPrice: 3499900,
    imageUrl: 'https://placehold.co/400x400/1a1410/fdfbf7?text=Sony+XM5',
    rating: 4.8, reviewCount: 189, category: 'Audio',
    stock: 15, stockLeft: 11,
    endsAtMs: Date.now() + 6 * 3600 * 1000,
  },
  {
    id: '3', slug: 'loreal-revitalift-serum', name: "L'Oréal Revitalift Serum 30ml",
    vendorName: 'Beauty & More', vendorId: 'v3', variantId: 'var3',
    price: 214900, originalPrice: 299900,
    imageUrl: 'https://placehold.co/400x400/b91c1c/fdfbf7?text=Serum',
    rating: 4.4, reviewCount: 543, category: 'Beauty',
    stock: 50, stockLeft: 18,
    endsAtMs: Date.now() + 2 * 3600 * 1000 + 45 * 60 * 1000,
  },
  {
    id: '4', slug: 'philips-air-fryer-hd9200', name: 'Philips Air Fryer 4.1L HD9200',
    vendorName: 'HomeAppliance Hub', vendorId: 'v4', variantId: 'var4',
    price: 1314900, originalPrice: 1599900,
    imageUrl: 'https://placehold.co/400x400/c98a2b/fdfbf7?text=Air+Fryer',
    rating: 4.5, reviewCount: 221, category: 'Home',
    stock: 8, stockLeft: 2,
    endsAtMs: Date.now() + 1 * 3600 * 1000 + 12 * 60 * 1000,
  },
  {
    id: '5', slug: 'nike-air-max-270', name: 'Nike Air Max 270 Sneakers',
    vendorName: 'SportZone Nepal', vendorId: 'v5', variantId: 'var5',
    price: 1332900, originalPrice: 1799900,
    imageUrl: 'https://placehold.co/400x400/1a1410/fdfbf7?text=Nike+270',
    rating: 4.7, reviewCount: 408, category: 'Fashion',
    stock: 20, stockLeft: 14,
    endsAtMs: Date.now() + 7 * 3600 * 1000,
  },
  {
    id: '6', slug: 'optimum-nutrition-whey-2lb', name: 'ON Gold Standard Whey 2lb',
    vendorName: 'FitNepal Store', vendorId: 'v6', variantId: 'var6',
    price: 474900, originalPrice: 599900,
    imageUrl: 'https://placehold.co/400x400/1a1410/fdfbf7?text=ON+Whey',
    rating: 4.9, reviewCount: 677, category: 'Health',
    stock: 30, stockLeft: 7,
    endsAtMs: Date.now() + 3 * 3600 * 1000 + 55 * 60 * 1000,
  },
  {
    id: '7', slug: 'casio-analog-watch', name: 'Casio Analog Day-Date Watch',
    vendorName: 'TimeKeepers Nepal', vendorId: 'v7', variantId: 'var7',
    price: 584900, originalPrice: 799900,
    imageUrl: 'https://placehold.co/400x400/c98a2b/1a1410?text=Casio',
    rating: 4.3, reviewCount: 154, category: 'Fashion',
    stock: 12, stockLeft: 9,
    endsAtMs: Date.now() + 5 * 3600 * 1000 + 30 * 60 * 1000,
  },
  {
    id: '8', slug: 'nikon-d3500-dslr', name: 'Nikon D3500 DSLR Kit 18-55mm',
    vendorName: 'Camera World Nepal', vendorId: 'v8', variantId: 'var8',
    price: 5499900, originalPrice: 6399900,
    imageUrl: 'https://placehold.co/400x400/1a1410/fdfbf7?text=Nikon+D3500',
    rating: 4.7, reviewCount: 92, category: 'Electronics',
    stock: 5, stockLeft: 5,
    endsAtMs: Date.now() + 8 * 3600 * 1000,
  },
]

const CATEGORIES = ['All', 'Phones', 'Audio', 'Electronics', 'Fashion', 'Beauty', 'Health', 'Home']

function getTimeLeft(endMs: number) {
  const total = Math.max(0, endMs - Date.now())
  return {
    total,
    hours: Math.floor(total / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  }
}

function CountdownPill({ endsAtMs }: { endsAtMs: number }) {
  const [t, setT] = useState(getTimeLeft(endsAtMs))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(endsAtMs)), 1000)
    return () => clearInterval(id)
  }, [endsAtMs])

  const pad = (n: number) => String(n).padStart(2, '0')
  const isUrgent = t.total < 2 * 3600 * 1000

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md
      ${isUrgent ? 'bg-crimson/10 text-crimson' : 'bg-paper-2 text-ink-2'}`}>
      <svg className={`w-2.5 h-2.5 ${isUrgent ? 'text-crimson' : 'text-ink-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
    </span>
  )
}

function StockBar({ stock, stockLeft }: { stock: number; stockLeft: number }) {
  const sold = stock - stockLeft
  const soldPct = Math.round((sold / stock) * 100)
  const isCritical = stockLeft <= 3

  return (
    <div className="mt-1.5">
      <div className="w-full h-1 bg-paper-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isCritical ? 'bg-crimson' : 'bg-gold'}`}
          style={{ width: `${soldPct}%` }}
        />
      </div>
      <p className={`text-[10px] mt-0.5 font-medium ${isCritical ? 'text-crimson' : 'text-ink-3'}`}>
        {isCritical ? `Only ${stockLeft} left!` : `${sold} sold · ${stockLeft} left`}
      </p>
    </div>
  )
}

export default function FlashSalesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const filtered = FLASH_DEALS.filter(
    (d) => (activeCategory === 'All' || d.category === activeCategory) && d.endsAtMs > now
  )

  const soonestEnd = Math.min(...FLASH_DEALS.map((d) => d.endsAtMs))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-ink mb-8 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-crimson/25 blur-3xl" />
          <div className="absolute -bottom-10 right-10 w-56 h-56 rounded-full bg-gold/15 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-crimson/20 border border-crimson/30 rounded-full px-3 py-1 mb-3">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-xs font-bold tracking-widest text-yellow-300 uppercase">Flash Sale</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
            Today's <span className="text-crimson">Hot</span> Deals
          </h1>
          <p className="text-white/60 text-sm max-w-xs">
            Limited-time offers from verified Nepali vendors. Prices drop, stock flies.
          </p>
        </div>

        {/* Global countdown */}
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-medium">Next sale ends in</p>
          <GlobalCountdown endsAtMs={soonestEnd} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border
              ${activeCategory === cat
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper text-ink-2 border-line-soft hover:border-ink-3'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Deal count */}
      <p className="text-sm text-ink-3 mb-5 font-medium">
        {filtered.length} active deals{activeCategory !== 'All' && ` in ${activeCategory}`}
      </p>

      {/* Product grid with overlaid countdown + stock */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-ink-3">
          <p className="text-5xl mb-4">⚡</p>
          <p className="text-lg font-medium">No active deals in {activeCategory}</p>
          <button onClick={() => setActiveCategory('All')} className="mt-4 btn-secondary">
            View all deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((deal) => (
            <div key={deal.id} className="flex flex-col gap-1.5">
              <ProductCard
                slug={deal.slug}
                name={deal.name}
                vendorName={deal.vendorName}
                price={deal.price}
                originalPrice={deal.originalPrice}
                imageUrl={deal.imageUrl}
                rating={deal.rating}
                reviewCount={deal.reviewCount}
                isFlashSale
                variantId={deal.variantId}
                vendorId={deal.vendorId}
              />
              <div className="px-1">
                <div className="flex items-center justify-between">
                  <CountdownPill endsAtMs={deal.endsAtMs} />
                  <span className="text-[10px] text-ink-3 font-medium">{deal.category}</span>
                </div>
                <StockBar stock={deal.stock} stockLeft={deal.stockLeft} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      <div className="mt-12 card p-5 flex items-start gap-4 border-line-soft">
        <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-ink mb-1">100% Genuine Flash Deals</p>
          <p className="text-xs text-ink-3 leading-relaxed">
            All flash sale products are verified for authenticity. Every vendor passes our KYC process before listing deals.
            Prices shown include GST. Free delivery on orders above Rs. 1,000.
          </p>
        </div>
      </div>
    </div>
  )
}

function GlobalCountdown({ endsAtMs }: { endsAtMs: number }) {
  const [t, setT] = useState(getTimeLeft(endsAtMs))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(endsAtMs)), 1000)
    return () => clearInterval(id)
  }, [endsAtMs])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 font-mono font-bold text-white">
      {[
        { val: pad(t.hours), label: 'hrs' },
        { val: pad(t.minutes), label: 'min' },
        { val: pad(t.seconds), label: 'sec' },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-1.5">
          <div className="flex flex-col items-center">
            <span className="tabular-nums text-2xl leading-none bg-white/10 border border-white/15 rounded-lg px-3 py-2">{val}</span>
            <span className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">{label}</span>
          </div>
          {i < 2 && <span className="text-white/40 text-xl mb-3">:</span>}
        </div>
      ))}
    </div>
  )
}
