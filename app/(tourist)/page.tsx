import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Globe,
  HeartHandshake,
  MapPin,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Header } from '@/components/common/header'
import { ExperienceCard } from '@/components/tourist/experience-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { listExperiences } from '@/lib/server/marketplace'

export default async function HomePage() {
  const featuredExperiences = (await listExperiences()).slice(0, 4)

  const stats = [
    { label: 'Verified hosts', value: '120+' },
    { label: 'Cultural regions represented', value: '18' },
    { label: 'Average guest rating', value: '4.8/5' },
  ]

  const trustPoints = [
    {
      icon: Shield,
      title: 'Verified operators',
      description:
        'Every host is reviewed for identity, reliability, and respectful cultural stewardship before publishing.',
    },
    {
      icon: Globe,
      title: 'Cultural authenticity',
      description:
        'Each listing highlights the provenance, community connection, and authenticity score behind the experience.',
    },
    {
      icon: HeartHandshake,
      title: 'Community-first value',
      description:
        'Bookings are designed to support local creators, protect heritage, and reward trusted operators directly.',
    },
  ]

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(190,89,48,0.18),transparent_35%),radial-gradient(circle_at_85%_18%,rgba(222,170,75,0.2),transparent_25%),linear-gradient(180deg,rgba(254,248,240,0.98),rgba(250,243,233,0.88))] py-20 md:py-28">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(111,78,55,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(111,78,55,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40" />
          <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-3xl">
                <Badge className="mb-6 rounded-full bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm hover:bg-background/80">
                  Premium African cultural discovery
                </Badge>
                <h1 className="mb-6 text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-7xl">
                  Discover Africa through hosts worth trusting.
                </h1>
                <p className="mb-8 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Browse exceptional cultural experiences freely, then sign in only when you want
                  to save, message a host, or secure a booking. AfriConnect makes discovery feel
                  effortless and commitment feel safe.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="rounded-full px-7">
                    <Link href="/experiences" className="flex items-center gap-2">
                      Explore Experiences <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full px-7">
                    <Link href="/quiz">Find Your Match</Link>
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/75 px-4 py-2 text-sm text-foreground shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Open browsing, gated actions
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/75 px-4 py-2 text-sm text-foreground shadow-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Investor-ready marketplace presentation
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[32px] border border-border/70 bg-background/85 p-6 shadow-[0_30px_90px_-45px_rgba(53,33,20,0.55)] backdrop-blur">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-muted/45 p-5">
                        <div className="text-3xl font-semibold tracking-tight text-foreground">
                          {stat.value}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[28px] bg-primary px-5 py-6 text-primary-foreground">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em]">
                      <CalendarClock className="h-4 w-4" />
                      Booking flow
                    </div>
                    <p className="mt-3 text-2xl font-semibold">Browse first. Commit later.</p>
                    <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                      Guests can inspect listings, dates, hosts, and cultural context before any
                      account wall appears.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60 py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Why guests trust AfriConnect
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Discovery designed for confidence, not friction.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {trustPoints.map((point) => {
                const Icon = point.icon

                return (
                  <div
                    key={point.title}
                    className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm"
                  >
                    <div className="inline-flex rounded-2xl bg-primary/8 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{point.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                  Featured now
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Cultural experiences with the warmth of boutique hospitality.
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Browse openly, compare authenticity signals, and save or message only when you
                  are ready to move.
                </p>
              </div>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/experiences" className="flex items-center gap-2">
                  View all experiences <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mb-8 grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-2">
              {featuredExperiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  featured={index === 0}
                />
              ))}
            </div>

            <div className="grid gap-4 rounded-[32px] border border-border/70 bg-muted/40 p-6 md:grid-cols-3">
              <div className="rounded-2xl bg-background/80 p-5">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">Local depth</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Listings foreground geography, regional identity, and host credibility from the
                  first glance.
                </p>
              </div>
              <div className="rounded-2xl bg-background/80 p-5">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">Human connection</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Every experience is positioned around real hosts, not anonymous inventory.
                </p>
              </div>
              <div className="rounded-2xl bg-background/80 p-5">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">Conversion with restraint</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Clear calls to action invite sign-up naturally, right at the point of
                  commitment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-[36px] bg-primary px-6 py-10 text-primary-foreground shadow-[0_28px_80px_-44px_rgba(111,48,26,0.75)] md:grid-cols-[1.15fr_0.85fr] md:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
                  Start your shortlist
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Turn curiosity into a curated itinerary.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/85">
                  Take the travel quiz for tailored recommendations, then create a session only
                  when you want to save, ask a host a question, or book.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link href="/quiz">Find Your Perfect Experience</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/experiences">Browse All Listings</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 bg-card py-12">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2 text-lg font-bold text-primary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    A
                  </div>
                  AfriConnect
                </div>
                <p className="text-sm text-muted-foreground">
                  Authentic cultural tourism connecting travelers with African heritage.
                </p>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">Explore</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/experiences" className="transition-colors hover:text-primary">
                      All Experiences
                    </Link>
                  </li>
                  <li>
                    <Link href="/quiz" className="transition-colors hover:text-primary">
                      Find My Match
                    </Link>
                  </li>
                  <li>
                    <Link href="/saved" className="transition-colors hover:text-primary">
                      Saved Experiences
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">For Operators</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/operator/dashboard"
                      className="transition-colors hover:text-primary"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/operator/experiences"
                      className="transition-colors hover:text-primary"
                    >
                      Manage Experiences
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="transition-colors hover:text-primary">
                      Become an Operator
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-foreground">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="#" className="transition-colors hover:text-primary">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-primary">
                      Community Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-primary">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 AfriConnect. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
