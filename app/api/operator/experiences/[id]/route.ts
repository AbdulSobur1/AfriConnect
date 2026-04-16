import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import {
  deleteOperatorExperience,
  getOperatorExperienceById,
  updateOperatorExperience,
} from '@/lib/server/marketplace'

const payloadSchema = z.object({
  title: z.string().min(3),
  category: z.enum(['cultural', 'culinary', 'craft', 'ritual', 'community']),
  description: z.string().min(10),
  shortDescription: z.string().min(10),
  image: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().min(3),
  duration: z.number().positive(),
  groupSize: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  location: z.object({
    city: z.string().min(1),
    region: z.string().min(1),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  highlights: z.array(z.string()),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  status: z.enum(['draft', 'pending-review', 'archived']).optional(),
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

    if (session.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(request, 'operator-experience-update', { windowMs: 60_000, maxRequests: 20 }, session.userId)

    const { id } = await params
    const payload = payloadSchema.parse(await request.json())
    const updatedId = await updateOperatorExperience(id, session.userId, payload)
    const experience = await getOperatorExperienceById(updatedId, session.userId)

    if (!experience) {
      throw new Error('Updated experience could not be loaded')
    }

    return NextResponse.json({ experience })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update experience'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    enforceRateLimit(_request, 'operator-experience-delete', { windowMs: 60_000, maxRequests: 10 }, session.userId)

    const { id } = await params
    const result = await deleteOperatorExperience(id, session.userId)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete experience'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
