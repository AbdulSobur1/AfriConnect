'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Heart, MapPin, MessageCircle, Users } from 'lucide-react'
import { Experience } from '@/lib/types'
import { useAuthRequired } from '@/components/auth/auth-required-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/context/toast-context'
import { AuthenticityBadge } from './authenticity-badge'
import { RatingBadge } from './rating-badge'

interface ExperienceCardProps {
  experience: Experience
  featured?: boolean
}

export function ExperienceCard({ experience, featured = false }: ExperienceCardProps) {
  const { addToast } = useToast()
  const { ensureSignedIn } = useAuthRequired()
  const [isSaved, setIsSaved] = useState(false)
  const [isSaveLoading, setIsSaveLoading] = useState(false)

  const categoryLabels = {
    cultural: 'Cultural',
    culinary: 'Culinary',
    craft: 'Craft',
    ritual: 'Spiritual',
    community: 'Community',
  }

  useEffect(() => {
    let cancelled = false

    async function loadSavedState() {
      try {
        const response = await fetch(`/api/saved/${experience.id}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const result = (await response.json()) as { saved?: boolean }

        if (!cancelled) {
          setIsSaved(Boolean(result.saved))
        }
      } catch {
        if (!cancelled) {
          setIsSaved(false)
        }
      }
    }

    void loadSavedState()

    return () => {
      cancelled = true
    }
  }, [experience.id])

  async function toggleSave() {
    setIsSaveLoading(true)

    try {
      const response = await fetch(`/api/saved/${experience.id}`, {
        method: isSaved ? 'DELETE' : 'POST',
      })

      const result = (await response.json()) as { error?: string; saved?: boolean }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update saved experience')
      }

      setIsSaved(Boolean(result.saved))
      addToast(
        result.saved ? 'Experience saved to your shortlist.' : 'Removed from your shortlist.',
        'success'
      )
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to update saved experience.', 'error')
    } finally {
      setIsSaveLoading(false)
    }
  }

  async function handleSaveClick() {
    await ensureSignedIn(
      {
        title: 'Save this experience',
        description:
          'Create a quick AfriConnect session to build your shortlist and revisit standout experiences later.',
      },
      toggleSave
    )
  }

  async function handleMessageClick() {
    await ensureSignedIn(
      {
        title: 'Message this host',
        description:
          'Sign in to contact verified hosts, ask questions, and plan confidently before booking.',
      },
      async () => {
        window.location.href = `mailto:${experience.operator.email}?subject=${encodeURIComponent(`Question about ${experience.title}`)}`
      }
    )
  }

  return (
    <article
      className={`group overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_18px_50px_-30px_rgba(38,23,16,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_65px_-34px_rgba(38,23,16,0.52)] ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <Link href={`/experiences/${experience.id}`} className="block">
        <div className="relative h-56 overflow-hidden bg-muted md:h-64">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? '(max-width: 768px) 100vw, 620px' : '(max-width: 768px) 100vw, 360px'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground hover:bg-background/90">
              {categoryLabels[experience.category]}
            </Badge>
            <Badge className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              Verified cultural experience
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <AuthenticityBadge
              badge={experience.authenticity.badge}
              score={experience.authenticity.score}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background"
              onClick={(event) => {
                event.preventDefault()
                void handleSaveClick()
              }}
              disabled={isSaveLoading}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-primary' : ''}`} />
            </Button>
          </div>
        </div>
      </Link>

      <div className="space-y-5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/experiences/${experience.id}`} className="block">
              <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-[1.35rem]">
                {experience.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {experience.shortDescription}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              ${experience.price}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              per guest
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Duration</span>
            </div>
            <p className="font-medium text-foreground">{experience.duration} hours</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>Group</span>
            </div>
            <p className="font-medium text-foreground">Up to {experience.groupSize.max}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location</span>
            </div>
            <p className="font-medium text-foreground">{experience.location.city}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <RatingBadge rating={experience.rating} reviewCount={experience.reviewCount} size="sm" />
          <div className="text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{experience.operator.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="rounded-full" asChild>
            <Link href={`/experiences/${experience.id}`}>
              View details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            onClick={() => void handleMessageClick()}
          >
            <MessageCircle className="h-4 w-4" />
            Message host
          </Button>
        </div>
      </div>
    </article>
  )
}
