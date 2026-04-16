import { ExperiencesPageClient } from '@/components/tourist/experiences-page-client'
import { listExperiences } from '@/lib/server/marketplace'

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const experiences = await listExperiences()
  const params = await searchParams

  return (
    <ExperiencesPageClient
      experiences={experiences}
      initialSearch={params.search?.trim() ?? ''}
    />
  )
}
