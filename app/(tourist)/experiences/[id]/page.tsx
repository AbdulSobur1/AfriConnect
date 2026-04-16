import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { ExperienceDetailPageClient } from '@/components/tourist/experience-detail-page-client'
import { getExperienceById } from '@/lib/server/marketplace'
import Link from 'next/link'

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const experience = await getExperienceById(id)

  if (!experience) {
    return (
      <>
        <Header userRole="tourist" />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Experience not found</h1>
            <Button asChild>
              <Link href="/experiences">Back to Experiences</Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  return <ExperienceDetailPageClient experience={experience} />
}
