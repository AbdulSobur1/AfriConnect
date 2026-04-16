'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/common/header'
import { RatingBadge } from '@/components/tourist/rating-badge'
import { AuthenticityBadge } from '@/components/tourist/authenticity-badge'
import { SubsectionToggle } from '@/components/tourist/subsection-toggle'
import { BookingModal } from '@/components/tourist/booking-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Experience } from '@/lib/types'
import { useToast } from '@/context/toast-context'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Users, Heart, Share2, Check, X } from 'lucide-react'

interface ExperienceDetailPageClientProps {
  experience: Experience
}

export function ExperienceDetailPageClient({
  experience,
}: ExperienceDetailPageClientProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isSaveLoading, setIsSaveLoading] = useState(false)

  const categoryLabels = {
    cultural: 'Cultural Experience',
    culinary: 'Culinary Experience',
    craft: 'Craft Workshop',
    ritual: 'Spiritual Experience',
    community: 'Community Experience',
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

  async function handleSaveToggle() {
    setIsSaveLoading(true)

    try {
      const response = await fetch(`/api/saved/${experience.id}`, {
        method: isSaved ? 'DELETE' : 'POST',
      })

      if (response.status === 401) {
        router.push(`/sign-in?redirectTo=${encodeURIComponent(`/experiences/${experience.id}`)}`)
        return
      }

      const result = (await response.json()) as { error?: string; saved?: boolean }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update saved experience')
      }

      setIsSaved(!isSaved)
      addToast(
        !isSaved ? 'Experience saved to your list.' : 'Experience removed from your saved list.',
        'success'
      )
      router.refresh()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to update saved list.', 'error')
    } finally {
      setIsSaveLoading(false)
    }
  }

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/experiences" className="transition-colors hover:text-foreground">
                Experiences
              </Link>
              <span>/</span>
              <span className="text-foreground">{experience.title}</span>
            </div>
          </div>
        </div>

        <div className="relative h-96 w-full overflow-hidden bg-muted md:h-[500px]">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute right-6 top-6 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleSaveToggle}
              disabled={isSaveLoading}
              className="rounded-full"
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <Badge className="bg-primary/90 text-primary-foreground">
                        {categoryLabels[experience.category]}
                      </Badge>
                      <AuthenticityBadge
                        badge={experience.authenticity.badge}
                        score={experience.authenticity.score}
                      />
                    </div>
                    <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                      {experience.title}
                    </h1>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <RatingBadge
                    rating={experience.rating}
                    reviewCount={experience.reviewCount}
                    size="lg"
                  />
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">${experience.price}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-border py-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Duration</span>
                    </div>
                    <p className="font-semibold text-foreground">{experience.duration} hours</p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Group Size</span>
                    </div>
                    <p className="font-semibold text-foreground">
                      {experience.groupSize.min}-{experience.groupSize.max} people
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Location</span>
                    </div>
                    <p className="font-semibold text-foreground">{experience.location.city}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">About This Experience</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {experience.description}
                </p>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">What You&apos;ll Learn</h2>
                <ul className="space-y-3">
                  {experience.highlights.map((highlight, index) => (
                    <li key={index} className="flex gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">What&apos;s Included</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">Included</h3>
                    <ul className="space-y-2">
                      {experience.inclusionsAndExclusions.includes.map((item, index) => (
                        <li key={index} className="flex gap-2 text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">Not Included</h3>
                    <ul className="space-y-2">
                      {experience.inclusionsAndExclusions.excludes.map((item, index) => (
                        <li key={index} className="flex gap-2 text-muted-foreground">
                          <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Accessibility</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Object.entries(experience.accessibility).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value ? (
                        <Check className="h-5 w-5 flex-shrink-0 text-primary" />
                      ) : (
                        <X className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={`text-sm capitalize ${
                          value ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="mb-6 text-2xl font-bold text-foreground">How to Book</h2>
                <SubsectionToggle subsections={experience.subsections} />
              </div>

              <div className="border-t border-border pt-8">
                <h2 className="mb-6 text-2xl font-bold text-foreground">Your Host</h2>
                <div className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={experience.operator.avatar}
                      alt={experience.operator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {experience.operator.name}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">{experience.operator.bio}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">
                          {experience.operator.reviewCount}
                        </span>
                        <span className="ml-1 text-muted-foreground">reviews</span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {experience.operator.rating}
                        </span>
                        <span className="ml-1 text-muted-foreground">rating</span>
                      </div>
                      <div className="capitalize">
                        <Badge variant="outline">{experience.operator.verificationStatus}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Price</p>
                    <p className="text-3xl font-bold text-primary">${experience.price}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="mb-3 text-sm font-semibold text-foreground">Available Dates</p>
                    <div className="space-y-2">
                      {experience.availability.map((slot) => (
                        <div key={slot.id} className="rounded-lg bg-muted p-3">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(slot.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {slot.spotsAvailable - slot.booked} spots available
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book Experience
                  </Button>
                </div>

                <Button variant="outline" size="lg" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <BookingModal
          experience={experience}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      </main>
    </>
  )
}
