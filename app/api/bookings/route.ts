import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import {
  createBooking,
  listOperatorBookings,
  listTouristBookings,
} from '@/lib/server/marketplace'

const createBookingSchema = z.object({
  experienceId: z.string().min(1),
  bookingDate: z.string().min(1),
  guests: z.number().int().positive(),
})

export async function GET(request: Request) {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope')

  if (scope === 'operator') {
    if (session.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bookings = await listOperatorBookings(session.userId)
    return NextResponse.json({ bookings })
  }

  if (session.role !== 'tourist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const bookings = await listTouristBookings(session.userId)
  return NextResponse.json({ bookings })
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'tourist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(request, 'booking-create', { windowMs: 60_000, maxRequests: 6 }, session.userId)

    const json = await request.json()
    const input = createBookingSchema.parse(json)
    const booking = await createBooking(input, session.userId)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create booking'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
