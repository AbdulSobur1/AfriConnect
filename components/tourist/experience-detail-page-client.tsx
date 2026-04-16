'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarCheck,
  Check,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { BackButton } from '@/components/common/back-button'
import { Header } from '@/components/common/header'
import { RatingBadge } from '@/components/tourist/rating-badge'
import { AuthenticityBadge } from '@/components/tourist/authenticity-badge'
import { SubsectionToggle } from '@/components/tourist/subsection-toggle'
import { BookingModal } from '@/components/tourist/booking-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Experience } from '@/lib/types'
import { useToast } from '@/context/toast-context'
import { useAuthRequired } from '@/components/auth/auth-required-provider'

interface ExperienceDetailPageClientProps {
  experience: Experience
}

export function ExperienceDetailPageClient({
  experience,
}: ExperienceDetailPageClientProps) {
  const { addToast } = useToast()
  const { ensureSignedIn } = useAuthRequired()
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

      const result = (await response.json()) as { error?: string; saved?: boolean }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update saved experience')
      }

      setIsSaved(Boolean(result.saved))
      addToast(
        result.saved ? 'Experience saved to your list.' : 'Experience removed from your saved list.',
        'success'
      )
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to update saved list.', 'error')
    } finally {
      setIsSaveLoading(false)
    }
  }

  async function handleSaveClick() {
    await ensureSignedIn(
      {
        title: 'Save this experience',
        description:
          'Sign in to build your shortlist and come back to verified experiences when you are ready to book.',
      },
      handleSaveToggle
    )
  }

  async function handleBookClick() {
    await ensureSignedIn(
      {
        title: 'Book securely',
        description:
          'Sign in to reserve your date, manage your itinerary, and keep booking details in one place.',
      },
      async () => setShowBookingModal(true)
    )
  }

  async function handleMessageClick() {
    await ensureSignedIn(
      {
        title: 'Message this host',
        description:
          'Sign in to ask questions about timing, accessibility, and group details before you book.',
      },
      async () => {
        window.location.href = `mailto:${experience.operator.email}?subject=${encodeURIComponent(`Question about ${experience.title}`)}`
      }
    )
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

        <div className="relative h-[300px] w-full overflow-hidden bg-muted sm:h-[380px] md:h-[540px]">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void handleSaveClick()}
              disabled={isSaveLoading}
              className="rounded-full bg-background/90"
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-background/90">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute bottom-6 left-6 right-6 hidden md:block">
            <div className="inline-flex flex-wrap items-center gap-3 rounded-full bg-background/88 px-5 py-3 shadow-lg backdrop-blur">
              <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                Premium cultural stay
              </Badge>
              <span className="text-sm text-muted-foreground">Verified host</span>
              <span className="text-sm text-muted-foreground">
                Flexible small-group format
              </span>
              <span className="text-sm text-muted-foreground">
                Secure checkout after sign-in
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8">
          <BackButton fallbackHref="/experiences" />
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
                    <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                      {experience.title}
                    </h1>
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <RatingBadge
                    rating={experience.rating}
                    reviewCount={experience.reviewCount}
                    size="lg"
                  />
                  <div className="text-left sm:text-right">
                    <div className="text-3xl font-bold text-primary">${experience.price}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-y border-border py-4 sm:grid-cols-3">
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

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Verified trust layer</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Host identity, authenticity scoring, and cultural review are surfaced before
                      you commit.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Flexible planning</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse availability openly, then secure your preferred date only when you are
                      ready.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card p-4">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Direct host access</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ask questions before checkout with privacy-preserving sign-in prompts on
                      demand.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">About This Experience</h2>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-relaxed">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
                <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-card p-5 shadow-sm sm:flex-row">
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
                    <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
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
              <div className="space-y-4 lg:sticky lg:top-20">
                <div className="space-y-4 rounded-[28px] border border-border/70 bg-card p-6 shadow-[0_18px_50px_-32px_rgba(38,23,16,0.45)]">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Starting from</p>
                    <p className="text-3xl font-bold text-primary">${experience.price}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>

                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="text-sm font-semibold text-foreground">What happens next</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Browse dates openly. Booking, saving, and host messaging ask for a quick
                      sign-in, then resume exactly where you left off.
                    </p>
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
                    onClick={() => void handleBookClick()}
                  >
                    Book Experience
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => void handleMessageClick()}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Host
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
