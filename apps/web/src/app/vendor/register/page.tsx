import Link from 'next/link'

export default function VendorRegisterRedirect() {
  return (
    <div className="bg-mesh-warm min-h-screen flex items-center justify-center p-4">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🏪</div>
        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Sell on हाम्रोBazaar</h1>
        <p className="text-ink-3 text-sm leading-relaxed mb-8">
          Join 2,000+ Nepali businesses already growing online. Zero setup cost,
          same-day eSewa/Khalti payouts, and a dashboard built for Nepal.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="http://localhost:3001/register"
            className="btn-primary w-full py-3 text-base"
          >
            Register as Vendor →
          </a>
          <Link href="/" className="btn-ghost w-full">Back to Home</Link>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['Zero commission first month', 'Fast KYC approval', 'WhatsApp support'].map((f) => (
            <span key={f} className="chip text-[11px]">✓ {f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
