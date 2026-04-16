import { requireRole } from '@/lib/server/auth'
import { listSavedExperiences } from '@/lib/server/marketplace'
import { SavedPageClient } from '@/components/tourist/saved-page-client'

export default async function SavedPage() {
  const session = await requireRole('tourist', '/saved')
  const experiences = await listSavedExperiences(session.userId)

  return <SavedPageClient experiences={experiences} />
}
