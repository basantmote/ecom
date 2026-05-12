'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FlashBarProps {
  endsAtMs: number
  label?: string
}

const TICKER_ITEMS = [
  { label: 'Samsung Galaxy A55 5G', discount: '8% OFF', href: '/products/samsung-galaxy-a55-5g' },
  { label: 'Nike Air Max 270', discount: '26% OFF', href: '/products/nike-air-max-270' },
  { label: 'Sony WH-1000XM5', discount: '10% OFF', href: '/products/sony-wh-1000xm5' },
  { label: 'Casio Analog Watch', discount: '27% OFF', href: '/products/casio-analog-watch' },
  { label: 'L\'Oréal Serum 30ml', discount: '28% OFF', href: '/products/loreal-revitalift-serum' },
  { label: 'ON Whey Protein 2lb', discount: '21% OFF', href: '/products/optimum-nutrition-whey-2lb' },
  { label: 'Philips Air Fryer 4.1L', discount: '18% OFF', href: '/products/philips-air-fryer-hd9200' },
  { label: 'Nikon D3500 Kit', discount: '14% OFF', href: '/products/nikon-d3500-dslr' },
]

// Duplicate for seamless loop
const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS]

export function FlashBar({ endsAtMs, label = 'Flash Sale' }: FlashBarProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endsAtMs))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(endsAtMs)), 1000)
    return () => clearInterval(id)
  }, [endsAtMs])

  if (timeLeft.total <= 0) return null

  return (
    <div className="flash-bar overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
        {/* Static label + timer */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">{label}</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-sm text-white">
            <TimeBlock value={timeLeft.hours} />
            <span className="opacity-60">:</span>
            <TimeBlock value={timeLeft.minutes} />
            <span className="opacity-60">:</span>
            <TimeBlock value={timeLeft.seconds} />
          </div>
          <div className="h-4 w-px bg-white/25 hidden sm:block" />
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="flex animate-marquee whitespace-nowrap gap-6">
            {DOUBLED.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="inline-flex items-center gap-2 flex-shrink-0 group"
              >
                <span className="text-white/80 text-xs group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <span className="badge bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] group-hover:bg-yellow-400/30 transition-colors">
                  {item.discount}
                </span>
                <span className="text-white/30 text-xs">·</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/flash-sales"
          className="flex-shrink-0 hidden sm:flex items-center gap-1 text-xs font-semibold text-white/90
                     hover:text-white border border-white/25 hover:border-white/50
                     rounded-lg px-3 py-1.5 transition-all"
        >
          All deals
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function TimeBlock({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-6 bg-black/25 rounded text-xs font-mono font-bold tabular-nums">
      {String(value).padStart(2, '0')}
    </span>
  )
}

function getTimeLeft(endMs: number) {
  const total = Math.max(0, endMs - Date.now())
  return {
    total,
    hours: Math.floor(total / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  }
}
