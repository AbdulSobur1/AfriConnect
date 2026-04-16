import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Header } from '@/components/common/header'
import { SiteFooter } from '@/components/common/site-footer'
import { ExperienceCard } from '@/components/tourist/experience-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listExperiences } from '@/lib/server/marketplace'

export default async function HomePage() {
  const experiences = await listExperiences()
  const browseExperiences = experiences.slice(0, 3)
  const featuredExperiences = experiences.slice(0, 4)
  const destinations = Array.from(
    new Map(
      experiences.map((experience) => [
        experience.location.city,
        {
          city: experience.location.city,
          region: experience.location.region,
          count: experiences.filter((item) => item.location.city === experience.location.city).length,
          image: experience.image,
          highlight: experience.title,
        },
      ])
    ).values()
  ).slice(0, 4)

  const howItWorks = [
    {
      title: 'Explore by destination or interest',
      description:
        'Browse cultural workshops, food experiences, community visits, and heritage-led activities across multiple cities.',
    },
    {
      title: 'Review the details that matter',
      description:
        'See the host, location, price, group size, and cultural authenticity indicators before making any decision.',
    },
    {
      title: 'Book when you are ready',
      description:
        'Save experiences, message hosts, and complete booking through a simple sign-in flow that appears only when needed.',
    },
  ]

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(190,89,48,0.16),transparent_34%),linear-gradient(180deg,rgba(254,248,240,0.98),rgba(250,243,233,0.88))] py-18 md:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(111,78,55,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(111,78,55,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-35" />
          <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="max-w-3xl">
                <Badge className="mb-5 rounded-full bg-background/85 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm hover:bg-background/85">
                  Discover authentic cultural travel
                </Badge>
                <h1 className="text-5xl font-bold leading-[1.04] tracking-tight text-foreground md:text-7xl">
                  Discover and book authentic African cultural experiences.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Explore experiences hosted by local experts, compare details with confidence, and
                  book the moments that match how you want to travel.
                </p>

                <form
                  action="/experiences"
                  className="mt-8 grid gap-3 rounded-[30px] border border-border/70 bg-background/88 p-3 shadow-[0_18px_50px_-34px_rgba(53,33,20,0.45)] backdrop-blur md:grid-cols-[1fr_auto]"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/45 px-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      name="search"
                      placeholder="Search by city, experience, or interest"
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <Button type="submit" size="lg" className="rounded-2xl px-6">
                    Explore Experiences
                  </Button>
                </form>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/experiences">
                      Browse all experiences
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-full">
                    <Link href="/quiz">Find your match</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[32px] border border-border/70 bg-background/88 p-6 shadow-[0_30px_90px_-45px_rgba(53,33,20,0.55)] backdrop-blur">
                  <h2 className="text-lg font-semibold text-foreground">What you can do here</h2>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-2xl bg-muted/45 p-4">
                      <div className="flex items-center gap-3">
                        <Compass className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Browse freely</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        View destinations, listings, dates, and hosts before signing in.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/45 p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Meet the host</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Every listing highlights the person behind the experience and what to expect.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/45 p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <p className="font-medium text-foreground">Book with confidence</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Save, message, and book only when you are ready to move forward.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className="border-b border-border/60 py-14 md:py-18">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                  Destinations
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Start with the places shaping each experience.
                </h2>
              </div>
              <Button asChild variant="ghost" className="w-fit rounded-full">
                <Link href="/experiences">See all destinations</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {destinations.map((destination) => (
                <Link
                  key={destination.city}
                  href={`/experiences?search=${encodeURIComponent(destination.city)}`}
                  className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={destination.image}
                      alt={`${destination.city}, ${destination.region}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex rounded-2xl bg-background/85 p-3 text-primary shadow-sm">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-semibold text-white">{destination.city}</h3>
                      <p className="mt-1 text-sm text-white/80">{destination.region}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground">
                      Browse cultural experiences hosted in and around {destination.city}.
                    </p>
                    <p className="mt-4 text-sm font-medium text-foreground">
                      Featured listing: {destination.highlight}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="browse-experiences" className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                  Browse experiences
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Explore real listings with the details travelers actually need.
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Every card includes the host, location, price, and experience format so you can
                  compare options quickly.
                </p>
              </div>
              <Button asChild variant="outline" className="w-fit rounded-full">
                <Link href="/experiences">View all listings</Link>
              </Button>
            </div>

            <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-3">
              {browseExperiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border/60 bg-muted/30 py-16 md:py-18">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                A simple path from discovery to booking.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {howItWorks.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[28px] border border-border/70 bg-background p-6 shadow-sm"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Featured experiences
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Start with some of the most compelling experiences on the platform.
              </h2>
            </div>

            <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-2">
              {featuredExperiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  featured={index === 0}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-border/60 py-16 md:py-18">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-[36px] bg-primary px-6 py-10 text-primary-foreground shadow-[0_28px_80px_-44px_rgba(111,48,26,0.75)] md:grid-cols-[1.1fr_0.9fr] md:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
                  About AfriConnect
                </p>
                <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                  Travel built around local culture, not generic itineraries.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-primary-foreground/85">
                  AfriConnect helps travelers discover cultural experiences hosted by people who
                  know the place, the practice, and the story behind it.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link href="/experiences">
                    Explore Experiences
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/quiz">
                    <Sparkles className="h-4 w-4" />
                    Find your match
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
