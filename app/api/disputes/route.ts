import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import { createBookingDispute } from '@/lib/server/marketplace'

const payloadSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().trim().min(10).max(500),
})

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'tourist') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(request, 'dispute-create', { windowMs: 60_000, maxRequests: 4 }, session.userId)

    const payload = payloadSchema.parse(await request.json())
    const booking = await createBookingDispute(payload.bookingId, session.userId, payload.reason)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit dispute'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
