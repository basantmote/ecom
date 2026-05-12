export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-paper border border-line-soft shadow-card animate-pulse">
      <div className="aspect-square bg-paper-3" />
      <div className="p-3 space-y-2.5">
        <div className="h-2 bg-paper-3 rounded w-1/2" />
        <div className="h-3.5 bg-paper-3 rounded w-full" />
        <div className="h-3.5 bg-paper-3 rounded w-4/5" />
        <div className="h-5 bg-paper-3 rounded w-2/5 mt-1" />
      </div>
    </div>
  )
}
