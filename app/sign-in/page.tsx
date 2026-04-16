import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { SignInForm } from '@/components/auth/sign-in-form'
import { getCurrentSession, getRoleHomePath } from '@/lib/server/auth'
import { listUsersFromStore } from '@/lib/server/data-store'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const session = await getCurrentSession()

  if (session) {
    redirect(getRoleHomePath(session.role))
  }

  const params = await searchParams
  const redirectTo = params.redirectTo || '/'
  const users = await listUsersFromStore()

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-3xl p-8">
        <SignInForm
          redirectTo={redirectTo}
          accounts={users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }))}
        />
      </Card>
    </main>
  )
}
