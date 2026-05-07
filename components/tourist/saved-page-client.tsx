'use client'

import { BackButton } from '@/components/common/back-button'
import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ExperienceCard } from '@/components/tourist/experience-card'
import { Experience } from '@/lib/types'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export function SavedPageClient({ experiences }: { experiences: Experience[] }) {
  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/" />
          <h1 className="mb-8 text-4xl font-bold text-foreground">Saved Experiences</h1>

          {experiences.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Heart className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No Saved Experiences</EmptyTitle>
                <EmptyDescription>
                  Start exploring and save your favorite experiences to come back to them later.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/experiences">Explore Experiences</Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
