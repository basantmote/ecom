'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface FlashBarProps {
  endsAt: Date
  label?: string
}

export function FlashBar({ endsAt, label = 'Flash Sale' }: FlashBarProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endsAt))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (timeLeft.total <= 0) return null

  return (
    <div className="flash-bar py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest uppercase opacity-75">
            {label}
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-lg">
            <Segment value={timeLeft.hours} label="h" />
            <span className="opacity-60 pb-0.5">:</span>
            <Segment value={timeLeft.minutes} label="m" />
            <span className="opacity-60 pb-0.5">:</span>
            <Segment value={timeLeft.seconds} label="s" />
          </div>
        </div>
        <Link
          href="/flash-sales"
          className="flex-shrink-0 text-sm font-medium underline underline-offset-2 hover:no-underline opacity-90 hover:opacity-100"
        >
          View all deals &rarr;
        </Link>
      </div>
    </div>
  )
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-[8px] font-sans font-normal opacity-60 tracking-wider uppercase">{label}</span>
    </span>
  )
}

function getTimeLeft(end: Date) {
  const total = Math.max(0, end.getTime() - Date.now())
  return {
    total,
    hours: Math.floor(total / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  }
}
