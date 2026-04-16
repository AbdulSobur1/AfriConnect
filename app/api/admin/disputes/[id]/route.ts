import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import { listAdminDisputes, resolveDispute } from '@/lib/server/marketplace'

const payloadSchema = z.object({
  action: z.literal('resolve'),
  resolutionNotes: z.string().trim().max(500).optional(),
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

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(request, 'admin-dispute-update', { windowMs: 60_000, maxRequests: 30 }, session.userId)

    const { id } = await params
    const payload = payloadSchema.parse(await request.json())

    await resolveDispute(id, payload.resolutionNotes)
    const disputes = await listAdminDisputes()
    const dispute = disputes.find((item) => item.id === id)

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json({ dispute })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to resolve dispute'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
