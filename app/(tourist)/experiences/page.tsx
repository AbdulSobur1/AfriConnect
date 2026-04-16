import { ExperiencesPageClient } from '@/components/tourist/experiences-page-client'
import { listExperiences } from '@/lib/server/marketplace'

export default async function ExperiencesPage() {
  const experiences = await listExperiences()

  return <ExperiencesPageClient experiences={experiences} />
}
