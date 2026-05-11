'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const SLIDES = [
  {
    id: 1,
    headline: 'Shop Nepal,\nShop Local',
    sub: 'Thousands of vendors. Delivered to your door.',
    cta: 'Explore Products',
    href: '/products',
    bg: 'from-ink to-ink-2',
  },
  {
    id: 2,
    headline: 'Flash Deals\nEvery Day',
    sub: 'Up to 60% off on top brands — for a limited time only.',
    cta: 'View Flash Sales',
    href: '/flash-sales',
    bg: 'from-crimson-deep to-crimson',
  },
  {
    id: 3,
    headline: 'Sell on\nहाम्रोBazaar',
    sub: 'Join thousands of vendors growing their business online.',
    cta: 'Start Selling',
    href: '/vendor/register',
    bg: 'from-amber-900 to-gold',
  },
]

export function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])

  const slide = SLIDES[active] ?? SLIDES[0]!

  return (
    <div className={`relative bg-gradient-to-br ${slide.bg} text-white transition-all duration-700`}>
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight whitespace-pre-line mb-4">
          {slide.headline}
        </h1>
        <p className="text-lg sm:text-xl opacity-80 mb-8 max-w-md">{slide.sub}</p>
        <Link
          href={slide.href}
          className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-md font-sans font-semibold text-sm hover:bg-paper-2 transition-colors"
        >
          {slide.cta} &rarr;
        </Link>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
