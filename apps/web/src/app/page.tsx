import { Hero } from '@/components/home/Hero'
import { FlashBar } from '@/components/home/FlashBar'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductCard } from '@/components/home/ProductCard'

// Placeholder products — replace with real API call once products are seeded
const FEATURED: React.ComponentProps<typeof ProductCard>[] = [
  {
    slug: 'samsung-galaxy-a55',
    name: 'Samsung Galaxy A55 5G (128GB)',
    vendorName: 'TechHub Nepal',
    price: 5499900,
    originalPrice: 5999900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Phone',
    rating: 4,
    reviewCount: 128,
  },
  {
    slug: 'nike-air-max',
    name: 'Nike Air Max 270 Running Shoes',
    vendorName: 'Sports World',
    price: 1249900,
    originalPrice: 1599900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Shoes',
    rating: 5,
    reviewCount: 64,
    isFlashSale: true,
  },
  {
    slug: 'philips-air-fryer',
    name: 'Philips Air Fryer HD9200',
    vendorName: 'Home Essentials',
    price: 899900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Fryer',
    rating: 4,
    reviewCount: 32,
  },
  {
    slug: 'loreal-serum',
    name: "L'Oreal Revitalift 1.5% Pure Hyaluronic Acid Serum",
    vendorName: 'Beauty Nepal',
    price: 249900,
    originalPrice: 349900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Serum',
    rating: 4,
    reviewCount: 87,
  },
  {
    slug: 'yoga-mat',
    name: 'Liforme Yoga Mat — 4mm Non-Slip',
    vendorName: 'Active Life Nepal',
    price: 349900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Yoga+Mat',
    rating: 5,
    reviewCount: 19,
  },
  {
    slug: 'bosch-drill',
    name: 'Bosch GSB 550 Watt Impact Drill',
    vendorName: 'Tools & Hardware',
    price: 599900,
    originalPrice: 749900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Drill',
    rating: 4,
    reviewCount: 41,
    isFlashSale: true,
  },
  {
    slug: 'wooden-bookshelf',
    name: 'Solid Wood 5-Tier Bookshelf',
    vendorName: 'Woodcraft Nepal',
    price: 1199900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Shelf',
    rating: 5,
    reviewCount: 8,
  },
  {
    slug: 'whey-protein',
    name: 'Optimum Nutrition Gold Standard Whey 2lb',
    vendorName: 'Nutrition Hub',
    price: 449900,
    originalPrice: 549900,
    imageUrl: 'https://placehold.co/400x400/ebe5d6/4a4239?text=Protein',
    rating: 4,
    reviewCount: 203,
    isFlashSale: true,
  },
]

// Flash sale ends in 6 hours from now (demo)
const FLASH_END = new Date(Date.now() + 6 * 60 * 60 * 1000)

export default function HomePage() {
  return (
    <>
      <Hero />
      <FlashBar endsAt={FLASH_END} label="Today's Flash Deals" />
      <CategoryGrid />

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-bold text-ink">Featured Products</h2>
          <a href="/products" className="text-sm text-crimson hover:underline">
            View all &rarr;
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURED.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </section>

      {/* Vendor CTA banner */}
      <section className="bg-paper-2 border-y border-line-soft mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">Sell on हाम्रोBazaar</h2>
            <p className="text-ink-2 text-sm max-w-md">
              Join thousands of Nepali businesses. Easy setup, fast payouts, and a platform that grows with you.
            </p>
          </div>
          <a
            href="/vendor/register"
            className="btn-primary flex-shrink-0 text-base px-6 py-3"
          >
            Start Selling Today
          </a>
        </div>
      </section>
    </>
  )
}
