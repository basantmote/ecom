'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// ─── 3 sets of 4 products, rotating every 10 s ──────────────────────────────
const PRODUCT_SETS = [
  [
    {
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Samsung Galaxy A55 5G',
      price: 'Rs. 54,999',
      originalPrice: 'Rs. 59,999',
      badge: '8% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
    {
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Nike Air Max 270',
      price: 'Rs. 12,499',
      originalPrice: 'Rs. 16,999',
      badge: '⚡ FLASH',
      badgeStyle: 'bg-crimson text-white',
    },
    {
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'MacBook Air M2',
      price: 'Rs. 1,49,999',
      originalPrice: null,
      badge: 'NEW',
      badgeStyle: 'bg-gold text-white',
    },
    {
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Casio Analog Watch',
      price: 'Rs. 3,999',
      originalPrice: 'Rs. 5,499',
      badge: '27% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
  ],
  [
    {
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Sony WH-1000XM5',
      price: 'Rs. 44,999',
      originalPrice: 'Rs. 49,999',
      badge: '10% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
    {
      image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Adidas Ultraboost 23',
      price: 'Rs. 18,999',
      originalPrice: 'Rs. 21,999',
      badge: '13% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
    {
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&auto=format&q=85',
      label: "L'Oréal Serum 30ml",
      price: 'Rs. 2,499',
      originalPrice: 'Rs. 3,499',
      badge: '⚡ FLASH',
      badgeStyle: 'bg-crimson text-white',
    },
    {
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Nikon D3500 DSLR Kit',
      price: 'Rs. 59,999',
      originalPrice: 'Rs. 69,999',
      badge: '14% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
  ],
  [
    {
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Philips Air Fryer 4.1L',
      price: 'Rs. 12,999',
      originalPrice: 'Rs. 15,999',
      badge: '18% OFF',
      badgeStyle: 'bg-white/15 backdrop-blur-sm text-white border border-white/20',
    },
    {
      image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'ON Gold Standard Whey 2lb',
      price: 'Rs. 5,499',
      originalPrice: 'Rs. 6,999',
      badge: '⚡ FLASH',
      badgeStyle: 'bg-crimson text-white',
    },
    {
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Redmi Note 13 Pro+ 5G',
      price: 'Rs. 49,999',
      originalPrice: null,
      badge: 'NEW',
      badgeStyle: 'bg-gold text-white',
    },
    {
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop&auto=format&q=85',
      label: 'Ceramic Dinnerware Set',
      price: 'Rs. 8,499',
      originalPrice: null,
      badge: 'HANDMADE',
      badgeStyle: 'bg-amber-600/80 text-white',
    },
  ],
]

const STATS = [
  { value: '50K+', label: 'Products' },
  { value: '2K+', label: 'Vendors' },
  { value: '77', label: 'Districts' },
  { value: '4.8★', label: 'Rating' },
]

const VALUE_PROPS = [
  { icon: '🚚', text: 'Free delivery above Rs. 999' },
  { icon: '💳', text: 'eSewa & Khalti' },
  { icon: '✓', text: '2,000+ verified vendors' },
]

const SOCIAL_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=40&h=40&fit=crop&auto=format',
]

const INTERVAL_MS = 10_000

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const [setIndex, setSetIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progressKey, setProgressKey] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  function goToSet(nextIndex: number) {
    setVisible(false)
    setTimeout(() => {
      setSetIndex(nextIndex)
      setProgressKey((k) => k + 1)
      setVisible(true)
    }, 420)
  }

  // Auto-rotate every 10 s — clean two-phase: fade-out → swap → fade-in
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setSetIndex((cur) => (cur + 1) % PRODUCT_SETS.length)
        setProgressKey((k) => k + 1)
        setVisible(true)
      }, 420)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const products = PRODUCT_SETS[setIndex] ?? PRODUCT_SETS[0]!

  return (
    <section className="relative bg-mesh-dark overflow-hidden min-h-[520px] flex items-center">
      {mounted && (
        <>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-crimson/20 blur-3xl animate-float pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2.5s' }} />
          <div className="absolute -bottom-24 left-1/2 w-64 h-64 rounded-full bg-crimson/10 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '5s' }} />
        </>
      )}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* ── LEFT: copy ───────────────────────────────────────────── */}
        <div className={mounted ? 'animate-fade-up' : 'opacity-0'}>

          {/* Eyebrow */}
          <p className="text-xs font-semibold text-gold/80 tracking-[0.18em] uppercase mb-4">
            Nepal&apos;s #1 Online Marketplace
          </p>

          {/* Live activity badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-6
                          glass-dark border border-white/15 text-xs cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-white font-semibold tracking-wide">LIVE</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-white/65">3,247 people shopping right now</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold text-white leading-[1.04] mb-5"
              style={{ fontSize: 'clamp(2.8rem, 5.8vw, 4.8rem)' }}>
            Shop Nepal,<br />
            <span className="text-gradient-hero">Shop Local.</span>
          </h1>

          <p className="text-ink-3 text-base sm:text-[17px] leading-relaxed mb-6 max-w-[420px]">
            Discover 50,000+ authentic products from 2,000+ verified Nepali vendors.
            Fast delivery across all 77 districts.
          </p>

          {/* Value prop chips */}
          <div className="flex flex-wrap gap-2 mb-7">
            {VALUE_PROPS.map((c) => (
              <span key={c.text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium
                           bg-white/10 border border-white/10 text-white/70">
                {c.icon} {c.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center flex-wrap gap-3 mb-8">
            <Link
              href="/products"
              className="btn-primary text-sm sm:text-base px-7 py-3 shadow-glow"
            >
              Explore Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/flash-sales"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white
                         border border-white/20 hover:border-white/50 rounded-xl px-5 py-3 transition-all"
            >
              Flash Deals →
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 mb-9">
            <div className="flex -space-x-2.5">
              {SOCIAL_AVATARS.map((src, i) => (
                <div key={i} className="w-8 h-8 rounded-full ring-2 ring-ink overflow-hidden flex-shrink-0 bg-ink-2">
                  <Image src={src} alt="Customer" width={32} height={32} className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-3.5 h-3.5 text-gold" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white text-xs font-bold ml-1.5">4.8</span>
              </div>
              <p className="text-white/50 text-[11px]">Trusted by 1,00,000+ Nepalis</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-mono font-bold text-xl sm:text-2xl text-white">{s.value}</p>
                <p className="text-[11px] text-ink-3 mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: rotating 2×2 collage ──────────────────────────── */}
        <div className={`hidden lg:flex flex-col gap-3 ${mounted ? 'animate-fade-up-2' : 'opacity-0'}`}>

          {/* 2×2 grid */}
          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <div
                key={`${setIndex}-${i}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  transition: 'opacity 0.42s ease, transform 0.42s cubic-bezier(0.16,1,0.3,1)',
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? 'translateY(0px) scale(1)'
                    : 'translateY(10px) scale(0.96)',
                  transitionDelay: visible ? `${i * 70}ms` : '0ms',
                }}
              >
                {/* Image */}
                <div className="aspect-square relative bg-ink-2 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.label}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    style={{ transform: undefined }} /* let className handle it */
                  />

                  {/* Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />

                  {/* Badge — top-left */}
                  <div className={`absolute top-2.5 left-2.5 badge text-[10px] ${p.badgeStyle}`}>
                    {p.badge}
                  </div>

                  {/* Price overlay — bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-white/90 text-[11px] font-medium truncate leading-tight mb-0.5">
                      {p.label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-gold font-mono font-bold text-sm">{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-white/40 font-mono text-[10px] line-through">
                          {p.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover shimmer ring */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent
                                  group-hover:ring-white/20 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div
              key={progressKey}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-crimson via-gold to-crimson"
              style={{ animation: `progressFill ${INTERVAL_MS}ms linear forwards` }}
            />
          </div>

          {/* Dots + trust badge row */}
          <div className="flex items-center justify-between">

            {/* Set indicator dots */}
            <div className="flex items-center gap-2">
              {PRODUCT_SETS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSet(i)}
                  aria-label={`Show product set ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-350
                              ${i === setIndex
                                ? 'w-7 bg-white'
                                : 'w-2 bg-white/30 hover:bg-white/55'
                              }`}
                />
              ))}
              <span className="text-[11px] text-ink-3 ml-1 tabular-nums">
                {setIndex + 1}/{PRODUCT_SETS.length}
              </span>
            </div>

            {/* Floating trust badge */}
            <div className="glass-dark rounded-xl px-3.5 py-2 flex items-center gap-2.5 border border-white/12">
              <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-[11px] font-semibold leading-none">Secure &amp; Verified</p>
                <p className="text-ink-3 text-[10px] mt-0.5">eSewa · Khalti · COD</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: horizontal product strip (visible < lg) ──────── */}
        <div className="lg:hidden flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {(PRODUCT_SETS[0] ?? []).map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 rounded-xl overflow-hidden relative"
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <div className="aspect-square relative bg-ink-2">
                <Image src={p.image} alt={p.label} fill sizes="144px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="text-white text-[10px] font-medium truncate">{p.label}</p>
                  <p className="text-gold font-mono text-[10px] font-bold">{p.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
