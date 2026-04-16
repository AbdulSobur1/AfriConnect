import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import {
  cancelTouristBooking,
  updateOperatorBooking,
} from '@/lib/server/marketplace'

const patchSchema = z.object({
  action: z.enum(['cancel', 'operator-update']),
  status: z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const payload = patchSchema.parse(await request.json())

    if (payload.action === 'cancel') {
      if (session.role !== 'tourist') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      enforceRateLimit(request, 'booking-cancel', { windowMs: 60_000, maxRequests: 6 }, session.userId)

      const booking = await cancelTouristBooking(id, session.userId)
      return NextResponse.json({ booking })
    }

    if (session.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(request, 'booking-operator-update', { windowMs: 60_000, maxRequests: 20 }, session.userId)

    const booking = await updateOperatorBooking(id, {
      status: payload.status,
      notes: payload.notes,
    }, session.userId)

    return NextResponse.json({ booking })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update booking'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
