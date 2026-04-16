import { requireRole } from '@/lib/server/auth'
import { listTouristPayments } from '@/lib/server/marketplace'
import { PaymentsPageClient } from '@/components/tourist/payments-page-client'

export default async function PaymentsPage() {
  const session = await requireRole('tourist', '/payments')
  const payments = await listTouristPayments(session.userId)

  return <PaymentsPageClient payments={payments} />
}
