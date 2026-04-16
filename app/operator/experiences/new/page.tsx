import { Header } from '@/components/common/header'
import { BackButton } from '@/components/common/back-button'
import { ExperienceForm } from '@/components/operator/experience-form'
import { requireRole } from '@/lib/server/auth'

export default async function NewExperiencePage() {
  const session = await requireRole('operator', '/operator/experiences/new')

  return (
    <>
      <Header userRole="operator" userName={session.name} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/operator/experiences" />
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Create Experience</h1>
            <p className="mt-2 text-muted-foreground">
              Draft a new experience and submit it for admin review when it is ready.
            </p>
          </div>
          <ExperienceForm mode="create" />
        </div>
      </main>
    </>
  )
}
