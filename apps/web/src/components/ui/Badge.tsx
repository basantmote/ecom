interface BadgeProps {
  variant?: 'crimson' | 'gold' | 'green' | 'neutral'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants = {
    crimson: 'bg-crimson text-white',
    gold: 'bg-gold text-white',
    green: 'bg-green-600 text-white',
    neutral: 'bg-paper-3 text-ink-2',
  }
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
