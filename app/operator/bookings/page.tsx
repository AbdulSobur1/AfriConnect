import { OperatorBookingsPageClient } from '@/components/operator/operator-bookings-page-client'
import { requireRole } from '@/lib/server/auth'
import { listOperatorBookings } from '@/lib/server/marketplace'

export default async function OperatorBookingsPage() {
  const session = await requireRole('operator', '/operator/bookings')
  const bookings = await listOperatorBookings(session.userId)

  return (
    <OperatorBookingsPageClient
      operatorName={session.name}
      initialBookings={bookings}
    />
  )
}
