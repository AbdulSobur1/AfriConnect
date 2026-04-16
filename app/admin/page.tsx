import { requireRole } from '@/lib/server/auth'
import { AdminConsoleClient } from '@/components/admin/admin-console-client'
import { getAdminModerationData } from '@/lib/server/marketplace'

export default async function AdminPage() {
  const session = await requireRole('admin', '/admin')
  const moderation = await getAdminModerationData()

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Admin Console</h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as {session.name}. This is the foundation for verification, moderation, and
            marketplace oversight.
          </p>
        </div>

        <AdminConsoleClient
          initialOperators={moderation.operators.map((operator) => ({
            id: operator.id,
            name: operator.name,
            email: operator.email,
            bio: operator.bio,
            verificationStatus: operator.verificationStatus,
          }))}
          initialExperiences={moderation.experiences.map((experience) => ({
            id: experience.id,
            title: experience.title,
            operatorName: experience.operator.name,
            status: experience.status,
            adminNotes: experience.adminNotes,
          }))}
          operations={moderation.operations}
          emailEvents={moderation.emailEvents}
          disputes={moderation.disputes}
        />
      </div>
    </main>
  )
}
