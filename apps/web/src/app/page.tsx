import Link from 'next/link'
import { Hero } from '@/components/home/Hero'
import { FlashBar } from '@/components/home/FlashBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductCard } from '@/components/home/ProductCard'
import { Collections } from '@/components/home/Collections'
import { StatsStrip } from '@/components/home/StatsStrip'

// ─── Demo data ─────────────────────────────────────────────────────────────────
// prices are in paisa (1 NPR = 100 paisa)

const FEATURED: React.ComponentProps<typeof ProductCard>[] = [
  {
    slug: 'samsung-galaxy-a55-5g',
    name: 'Samsung Galaxy A55 5G (8GB/128GB) — Awesome Navy',
    vendorName: 'TechHub Nepal',
    price: 5499900,
    originalPrice: 5999900,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 214,
    variantId: 'demo-v1',
    vendorId: 'demo-vendor-1',
  },
  {
    slug: 'nike-air-max-270',
    name: "Nike Air Max 270 Men's Running Shoes",
    vendorName: 'Sports World Kathmandu',
    price: 1249900,
    originalPrice: 1699900,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 89,
    isFlashSale: true,
    variantId: 'demo-v2',
    vendorId: 'demo-vendor-2',
  },
  {
    slug: 'philips-air-fryer-hd9200',
    name: 'Philips Air Fryer HD9200/90 (1400W, 4.1L)',
    vendorName: 'Home Essentials Nepal',
    price: 1299900,
    originalPrice: 1599900,
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 56,
    variantId: 'demo-v3',
    vendorId: 'demo-vendor-3',
  },
  {
    slug: 'loreal-revitalift-serum',
    name: "L'Oréal Revitalift 1.5% Pure Hyaluronic Acid Serum 30ml",
    vendorName: 'Beauty Nepal Official',
    price: 249900,
    originalPrice: 349900,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 132,
    isFlashSale: true,
    variantId: 'demo-v4',
    vendorId: 'demo-vendor-4',
  },
  {
    slug: 'apple-macbook-air-m2',
    name: 'Apple MacBook Air M2 (8GB/256GB SSD) — Midnight',
    vendorName: 'iStore Nepal',
    price: 14999900,
    originalPrice: 15999900,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 341,
    variantId: 'demo-v5',
    vendorId: 'demo-vendor-5',
  },
  {
    slug: 'casio-analog-watch',
    name: 'Casio Men\'s Analog Quartz Watch MTP-V001GL-7B',
    vendorName: 'Watch World Nepal',
    price: 399900,
    originalPrice: 549900,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 67,
    isFlashSale: true,
    variantId: 'demo-v6',
    vendorId: 'demo-vendor-6',
  },
  {
    slug: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    vendorName: 'AudioZone Nepal',
    price: 4499900,
    originalPrice: 4999900,
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 178,
    variantId: 'demo-v7',
    vendorId: 'demo-vendor-7',
  },
  {
    slug: 'optimum-nutrition-whey-2lb',
    name: 'Optimum Nutrition Gold Standard 100% Whey 2lb — Chocolate',
    vendorName: 'Nutrition Hub Nepal',
    price: 549900,
    originalPrice: 699900,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 203,
    isFlashSale: true,
    variantId: 'demo-v8',
    vendorId: 'demo-vendor-8',
  },
]

const NEW_ARRIVALS: React.ComponentProps<typeof ProductCard>[] = [
  {
    slug: 'redmi-note-13-pro',
    name: 'Redmi Note 13 Pro+ 5G (12GB/256GB) — Aurora Purple',
    vendorName: 'Mobile Pasal',
    price: 4999900,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 45,
    variantId: 'demo-v9',
    vendorId: 'demo-vendor-1',
  },
  {
    slug: 'adidas-ultraboost-23',
    name: 'Adidas Ultraboost 23 Running Shoe (Unisex)',
    vendorName: 'Sports World Kathmandu',
    price: 1899900,
    originalPrice: 2199900,
    imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 4,
    reviewCount: 28,
    variantId: 'demo-v10',
    vendorId: 'demo-vendor-2',
  },
  {
    slug: 'nikon-d3500-dslr',
    name: 'Nikon D3500 DSLR Camera with AF-P 18–55mm Lens Kit',
    vendorName: 'CameraZone Nepal',
    price: 5999900,
    originalPrice: 6999900,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 94,
    variantId: 'demo-v11',
    vendorId: 'demo-vendor-9',
  },
  {
    slug: 'ceramic-dinnerware-set',
    name: 'Handcrafted Ceramic Dinnerware Set (16 Pieces)',
    vendorName: 'Pottery Nepal',
    price: 849900,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=480&h=480&fit=crop&auto=format&q=80',
    rating: 5,
    reviewCount: 12,
    variantId: 'demo-v12',
    vendorId: 'demo-vendor-10',
  },
]

// Flash sale ends ~5h 47m from server render (demo)
const FLASH_END_MS = Date.now() + 5 * 60 * 60 * 1000 + 47 * 60 * 1000

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="bg-mesh-warm">
      {/* 1 — Hero */}
      <Hero />

      {/* 2 — Flash deal ticker */}
      <FlashBar endsAtMs={FLASH_END_MS} label="Flash Deals" />

      {/* 3 — Categories */}
      <CategoryGrid />

      {/* 4 — Curated collections */}
      <Collections />

      {/* 5 — Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">
            Featured Products
            <span className="ml-2 badge bg-crimson text-white text-[10px]">HOT</span>
          </h2>
          <Link href="/products" className="text-sm text-crimson hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURED.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* 6 — Stats strip */}
      <StatsStrip />

      {/* 7 — New arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">New Arrivals</h2>
          <Link href="/products?sort=newest" className="text-sm text-crimson hover:underline font-medium">
            See all new →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {NEW_ARRIVALS.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* 8 — Top vendors */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="section-title mb-6">Top Vendors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TOP_VENDORS.map((v) => (
            <Link
              key={v.slug}
              href={`/vendors/${v.slug}`}
              className="card-hover p-5 flex flex-col items-center text-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-paper-2 border border-line-soft flex items-center justify-center text-3xl shadow-sm">
                {v.icon}
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{v.name}</p>
                <p className="text-xs text-ink-3 mt-0.5">{v.tagline}</p>
                <p className="text-[11px] text-gold font-medium mt-1">⭐ {v.rating} · {v.products} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 9 — Vendor CTA */}
      <section className="bg-mesh-dark mt-6">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="chip border-white/15 bg-white/8 text-white/70 mb-4 w-fit">For Sellers</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-3">
              Sell on हाम्रोBazaar
            </h2>
            <p className="text-ink-3 text-sm max-w-md leading-relaxed">
              Join 2,000+ Nepali businesses already growing online. Zero setup cost,
              same-day eSewa/Khalti payouts, and a dashboard built for Nepal.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {['Zero commission first month', 'Fast KYC approval', 'WhatsApp support'].map((f) => (
                <span key={f} className="chip border-white/15 bg-white/8 text-white/70 text-[11px]">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/vendor/register"
            className="flex-shrink-0 bg-white text-ink font-bold text-sm px-8 py-4 rounded-2xl
                       hover:bg-paper-2 active:scale-95 transition-all shadow-float whitespace-nowrap"
          >
            Start Selling Free →
          </Link>
        </div>
      </section>
    </div>
  )
}

const TOP_VENDORS = [
  { slug: 'techub-nepal', name: 'TechHub Nepal', icon: '💻', tagline: 'Electronics & Gadgets', rating: '4.9', products: '1,240' },
  { slug: 'sports-world', name: 'Sports World', icon: '🏃', tagline: 'Sportswear & Equipment', rating: '4.8', products: '890' },
  { slug: 'beauty-nepal', name: 'Beauty Nepal', icon: '💄', tagline: 'Skincare & Cosmetics', rating: '4.7', products: '640' },
  { slug: 'home-essentials', name: 'Home Essentials', icon: '🏠', tagline: 'Kitchen & Living', rating: '4.8', products: '520' },
]
