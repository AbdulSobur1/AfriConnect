import { redirect } from 'next/navigation'
import { BackButton } from '@/components/common/back-button'
import { Card } from '@/components/ui/card'
import { SignInForm } from '@/components/auth/sign-in-form'
import { getCurrentSession, getRoleHomePath } from '@/lib/server/auth'

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-3xl space-y-4">
        <BackButton fallbackHref="/" />
        <Card className="w-full p-8">
          <SignInForm
            redirectTo={redirectTo}
            title="Access AfriConnect"
            description="Sign in to your account or create one to book, save, and manage cultural experiences."
          />
        </Card>
      </div>
    </main>
  )
}
