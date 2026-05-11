import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-ink text-paper-3 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <span className="font-serif text-xl font-bold text-paper">
            हाम्रो<span className="text-crimson">Bazaar</span>
          </span>
          <p className="mt-3 text-sm text-ink-3 leading-relaxed">
            Nepal&apos;s modern multi-vendor marketplace. Shop local, support Nepali businesses.
          </p>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-paper mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm">
            {['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Groceries'].map((c) => (
              <li key={c}>
                <Link href={`/products?category=${c.toLowerCase().replace(' & ', '-')}`} className="hover:text-paper transition-colors">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-paper mb-3 text-sm">Sell</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/vendor/register" className="hover:text-paper transition-colors">Become a Vendor</Link></li>
            <li><Link href="/vendor/dashboard" className="hover:text-paper transition-colors">Vendor Dashboard</Link></li>
            <li><Link href="/vendor/docs" className="hover:text-paper transition-colors">Seller Guide</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-paper mb-3 text-sm">Help</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-paper transition-colors">Help Centre</Link></li>
            <li><Link href="/returns" className="hover:text-paper transition-colors">Returns & Refunds</Link></li>
            <li><Link href="/track" className="hover:text-paper transition-colors">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-paper mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-paper transition-colors">About Us</Link></li>
            <li><Link href="/privacy" className="hover:text-paper transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-paper transition-colors">Terms of Use</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-2">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-ink-3">
          <p>&copy; {new Date().getFullYear()} हाम्रोBazaar. All rights reserved.</p>
          <p>Payments: eSewa &middot; Khalti &middot; COD</p>
        </div>
      </div>
    </footer>
  )
}
