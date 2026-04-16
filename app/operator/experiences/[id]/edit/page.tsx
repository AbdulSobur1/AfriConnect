import { notFound } from 'next/navigation'
import { Header } from '@/components/common/header'
import { ExperienceForm } from '@/components/operator/experience-form'
import { requireRole } from '@/lib/server/auth'
import { getOperatorExperienceById } from '@/lib/server/marketplace'

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireRole('operator', '/operator/experiences')
  const { id } = await params
  const experience = await getOperatorExperienceById(id, session.userId)

  if (!experience) {
    notFound()
  }

  return (
    <>
      <Header userRole="operator" userName={session.name} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Edit Experience</h1>
            <p className="mt-2 text-muted-foreground">
              Update your listing details, then send it back through review if needed.
            </p>
          </div>
          <ExperienceForm mode="edit" initialExperience={experience} />
        </div>
      </main>
    </>
  )
}
