'use client'

import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
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
          <h1 className="mb-8 text-4xl font-bold text-foreground">Saved Experiences</h1>

          {experiences.length === 0 ? (
            <Empty
              icon={Heart}
              title="No Saved Experiences"
              description="Start exploring and save your favorite experiences to come back to them later."
              action={
                <Button asChild>
                  <Link href="/experiences">Explore Experiences</Link>
                </Button>
              }
            />
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
