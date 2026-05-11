import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'

interface ProductCardProps {
  slug: string
  name: string
  vendorName: string
  price: number
  originalPrice?: number
  imageUrl: string
  rating?: number
  reviewCount?: number
  isFlashSale?: boolean
}

function formatNPR(paisa: number) {
  return `Rs. ${(paisa / 100).toLocaleString('en-NP')}`
}

export function ProductCard({
  slug,
  name,
  vendorName,
  price,
  originalPrice,
  imageUrl,
  rating,
  reviewCount,
  isFlashSale,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

  return (
    <Link href={`/products/${slug}`} className="card block group overflow-hidden">
      <div className="relative aspect-square bg-paper-2 overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isFlashSale && (
          <span className="absolute top-2 left-2 badge bg-crimson text-white text-[10px] font-bold">
            FLASH
          </span>
        )}
        {discount >= 5 && !isFlashSale && (
          <span className="absolute top-2 left-2 badge bg-gold text-white text-[10px] font-bold">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-ink-3 mb-1 truncate">{vendorName}</p>
        <h3 className="text-sm font-medium text-ink line-clamp-2 leading-snug mb-2">{name}</h3>

        <div className="flex items-baseline gap-2">
          <span className="price text-base font-bold text-ink">{formatNPR(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="price text-xs text-ink-3 line-through">{formatNPR(originalPrice)}</span>
          )}
        </div>

        {rating !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-gold text-xs">{'★'.repeat(Math.round(rating))}</span>
            {reviewCount !== undefined && (
              <span className="text-xs text-ink-3">({reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
