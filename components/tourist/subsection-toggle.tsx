'use client'

import { useState } from 'react'
import { Experience } from '@/lib/types'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ExternalLink, ArrowRight } from 'lucide-react'

interface SubsectionToggleProps {
  subsections: Experience['subsections']
}

export function SubsectionToggle({ subsections }: SubsectionToggleProps) {
  const [activeType, setActiveType] = useState<'direct' | 'partner'>('direct')

  const activeSubsections = subsections.filter((s) => s.type === activeType)

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveType('direct')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeType === 'direct'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Book Directly
        </button>
        <button
          onClick={() => setActiveType('partner')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeType === 'partner'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Partner Platforms
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeSubsections.map((subsection) => (
          <div
            key={subsection.id}
            className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row gap-4 p-6">
              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-32 h-32 relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={subsection.image}
                  alt={subsection.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">{subsection.title}</h3>
                <p className="text-muted-foreground mb-4">{subsection.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {subsection.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium"
                    >
                      {platform === 'direct' ? 'Direct Booking' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  ))}
                </div>

                <Button asChild className="gap-2">
                  <a href={subsection.url || '#'} target="_blank" rel="noopener noreferrer">
                    {subsection.type === 'direct' ? 'Book Now' : 'View on Platform'}
                    {subsection.url && <ExternalLink className="w-4 h-4" />}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
