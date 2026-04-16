import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import {
  getExperienceForAdmin,
  updateExperienceModeration,
} from '@/lib/server/marketplace'

const payloadSchema = z.object({
  status: z.enum(['draft', 'pending-review', 'published', 'archived']),
  adminNotes: z.string().optional(),
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

    enforceRateLimit(request, 'admin-experience-update', { windowMs: 60_000, maxRequests: 30 }, session.userId)

    const { id } = await params
    const payload = payloadSchema.parse(await request.json())
    const updatedId = await updateExperienceModeration(id, payload)
    const experience = await getExperienceForAdmin(updatedId)

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
    }

    return NextResponse.json({
      experience: {
        id: experience.id,
        title: experience.title,
        operatorName: experience.operator.name,
        status: experience.status,
        adminNotes: experience.adminNotes,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update experience'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
