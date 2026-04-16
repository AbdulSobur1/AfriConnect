import { Header } from '@/components/common/header'
import { ExperienceCard } from '@/components/tourist/experience-card'
import { Button } from '@/components/ui/button'
import { listExperiences } from '@/lib/server/marketplace'
import Link from 'next/link'
import { ArrowRight, Users, Shield, Globe } from 'lucide-react'

export default async function HomePage() {
  const featuredExperiences = (await listExperiences()).slice(0, 4)

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/10 py-20 md:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl">
                Experience Africa Like Never Before
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
                Connect with authentic cultural experiences, learn from master artisans, and
                create memories that honor African heritage.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/experiences" className="flex items-center gap-2">
                    Explore Experiences <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/quiz">Take the Quiz</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Verified Operators</h3>
                  <p className="text-muted-foreground">
                    Every operator is verified and committed to authentic, respectful experiences.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Globe className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Cultural Authenticity
                  </h3>
                  <p className="text-muted-foreground">
                    Every experience is rooted in genuine cultural practices and community
                    traditions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Community First</h3>
                  <p className="text-muted-foreground">
                    Your participation directly benefits local communities and supports cultural
                    preservation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Featured Experiences
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Handpicked experiences showcasing the richness of African culture
              </p>
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

            <div className="text-center">
              <Button asChild size="lg" variant="outline">
                <Link href="/experiences" className="flex items-center gap-2">
                  View All Experiences <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground md:py-20">
          <div className="container mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Your Journey?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Let us match you with experiences that align with your interests and travel style.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/quiz">Find Your Perfect Experience</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border bg-card py-12">
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
                    <Link href="/bookings" className="transition-colors hover:text-primary">
                      My Bookings
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
