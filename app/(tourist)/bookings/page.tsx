import { TouristBookingsPageClient } from '@/components/tourist/tourist-bookings-page-client'
import { requireRole } from '@/lib/server/auth'
import { listTouristBookings } from '@/lib/server/marketplace'

export default async function BookingsPage() {
  const session = await requireRole('tourist', '/bookings')
  const bookings = await listTouristBookings(session.userId)

  return <TouristBookingsPageClient initialBookings={bookings} />
}
