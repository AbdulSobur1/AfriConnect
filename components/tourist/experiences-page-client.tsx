'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/common/header'
import { ExperienceCard } from '@/components/tourist/experience-card'
import { ExperienceFilter } from '@/components/tourist/experience-filter'
import { Experience, ExperienceFilters } from '@/lib/types'

interface ExperiencesPageClientProps {
  experiences: Experience[]
  initialSearch?: string
}

export function ExperiencesPageClient({
  experiences,
  initialSearch = '',
}: ExperiencesPageClientProps) {
  const [filters, setFilters] = useState<ExperienceFilters>(() =>
    initialSearch ? { search: initialSearch } : {}
  )

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(exp.category)) return false
      }

      if (filters.priceRange) {
        if (exp.price < filters.priceRange[0] || exp.price > filters.priceRange[1]) {
          return false
        }
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !exp.title.toLowerCase().includes(searchLower) &&
          !exp.description.toLowerCase().includes(searchLower) &&
          !exp.location.city.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      if (filters.rating) {
        if (exp.rating < filters.rating) return false
      }

      return true
    })
  }, [experiences, filters])

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(190,89,48,0.14),transparent_35%),linear-gradient(180deg,rgba(254,248,240,0.96),rgba(250,243,233,0.84))] py-12 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Browse openly
              </p>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Discover Authentic African Experiences
              </h1>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground">
                Connect with local communities and master artisans. Immerse yourself in cultural
                traditions, culinary arts, and timeless practices, then sign in only when you want
                to save, message, or book.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <aside className="lg:col-span-1">
                <div className="sticky top-20">
                  <ExperienceFilter filters={filters} onFiltersChange={setFilters} />
                </div>
              </aside>

              <div className="lg:col-span-3">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                      {filteredExperiences.length}
                    </span>{' '}
                    experiences
                  </p>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    Verified hosts, authenticity badges, and clear booking signals on every listing
                  </p>
                </div>

                {filteredExperiences.length > 0 ? (
                  <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredExperiences.map((experience, index) => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                        featured={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-lg text-muted-foreground">
                      No experiences found matching your filters. Try adjusting your search.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
