import { Star } from 'lucide-react'

interface RatingBadgeProps {
  rating: number
  reviewCount: number
  size?: 'sm' | 'md' | 'lg'
}

export function RatingBadge({ rating, reviewCount, size = 'md' }: RatingBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  }

  const starSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <div className="flex items-center gap-0.5">
        <Star className={`${starSizeClasses[size]} fill-secondary text-secondary`} />
        <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      </div>
      <span className="text-muted-foreground">({reviewCount} reviews)</span>
    </div>
  )
}
