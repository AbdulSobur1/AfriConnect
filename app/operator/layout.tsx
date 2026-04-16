import { requireRole } from '@/lib/server/auth'

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('operator', '/operator/dashboard')
  return <>{children}</>
}
