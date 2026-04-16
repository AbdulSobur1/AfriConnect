'use client'

import { Experience } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users } from 'lucide-react'
import { RatingBadge } from './rating-badge'
import { AuthenticityBadge } from './authenticity-badge'
import { Badge } from '@/components/ui/badge'

interface ExperienceCardProps {
  experience: Experience
  featured?: boolean
}

export function ExperienceCard({ experience, featured = false }: ExperienceCardProps) {
  const categoryLabels = {
    cultural: 'Cultural',
    culinary: 'Culinary',
    craft: 'Craft',
    ritual: 'Spiritual',
    community: 'Community',
  }

  return (
    <Link href={`/experiences/${experience.id}`}>
      <div className={`group rounded-lg overflow-hidden bg-card border border-border transition-all hover:shadow-lg hover:scale-105 ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden bg-muted h-48 md:h-56">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes={featured ? '(max-width: 768px) 100vw, 600px' : '(max-width: 768px) 100vw, 300px'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 hover:bg-primary text-primary-foreground">
              {categoryLabels[experience.category]}
            </Badge>
          </div>

          {/* Authenticity Badge */}
          <div className="absolute top-3 right-3">
            <AuthenticityBadge badge={experience.authenticity.badge} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          <h3 className="font-semibold text-base md:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {experience.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {experience.shortDescription}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{experience.duration}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{experience.groupSize.max} max</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{experience.location.city}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground">{experience.location.city}, {experience.location.region}</span>
          </div>

          {/* Rating & Price */}
          <div className="flex items-center justify-between">
            <RatingBadge rating={experience.rating} reviewCount={experience.reviewCount} size="sm" />
            <div className="text-right">
              <span className="text-lg font-bold text-primary">${experience.price}</span>
              <span className="text-xs text-muted-foreground ml-1">/person</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
