import Link from 'next/link'

const LINKS = {
  Shop: [
    { label: 'Electronics', href: '/products?category=electronics' },
    { label: 'Fashion', href: '/products?category=fashion' },
    { label: 'Home & Living', href: '/products?category=home-living' },
    { label: 'Beauty', href: '/products?category=beauty' },
    { label: 'Sports', href: '/products?category=sports' },
  ],
  Sell: [
    { label: 'Become a Vendor', href: '/vendor/register' },
    { label: 'Vendor Dashboard', href: '/vendor/dashboard' },
    { label: 'Seller Guide', href: '/vendor/docs' },
    { label: 'Commission Rates', href: '/vendor/pricing' },
  ],
  Help: [
    { label: 'Help Centre', href: '/help' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Track Order', href: '/track' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Careers', href: '/careers' },
  ],
}

const PAYMENTS = ['eSewa', 'Khalti', 'COD', 'Credits']

export function Footer() {
  return (
    <footer className="bg-ink border-t border-ink-2/50">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10">
        {/* Brand col */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <span className="font-serif text-xl font-bold text-paper">
              हाम्रो<span className="text-gradient-crimson">Bazaar</span>
            </span>
          </Link>
          <p className="text-ink-3 text-sm leading-relaxed mb-5 max-w-xs">
            Nepal&apos;s modern multi-vendor marketplace. Shop local, support Nepali businesses, get it delivered anywhere in 77 districts.
          </p>
          {/* Payment chips */}
          <div className="flex flex-wrap gap-2">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-lg bg-ink-2/50 border border-ink-2 text-ink-3 text-[11px] font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([group, links]) => (
          <div key={group}>
            <h4 className="text-paper text-sm font-semibold mb-4">{group}</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-ink-3 text-sm hover:text-paper transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-2/40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-ink-3 text-xs">
            &copy; {new Date().getFullYear()} हाम्रोBazaar Pvt. Ltd. · Kathmandu, Nepal
          </p>
          <p className="text-ink-3 text-xs">
            Made with ♥ for Nepal
          </p>
        </div>
      </div>
    </footer>
  )
}
