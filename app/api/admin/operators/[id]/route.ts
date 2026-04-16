import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import { updateOperatorVerification } from '@/lib/server/marketplace'

const payloadSchema = z.object({
  verificationStatus: z.enum(['verified', 'pending', 'unverified']),
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

    enforceRateLimit(request, 'admin-operator-update', { windowMs: 60_000, maxRequests: 30 }, session.userId)

    const { id } = await params
    const payload = payloadSchema.parse(await request.json())
    const operator = await updateOperatorVerification(id, payload.verificationStatus)

    return NextResponse.json({ operator })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update operator'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
