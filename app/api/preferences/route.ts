import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import {
  getTouristPreferences,
  saveTouristPreferences,
} from '@/lib/server/marketplace'

const payloadSchema = z.object({
  interests: z.array(z.string()),
  budget: z.enum(['budget', 'moderate', 'luxury']),
  groupSize: z.number().int().positive(),
  travelStyle: z.string().min(1),
  mobility: z.enum(['full', 'limited']),
  previousExperience: z.boolean(),
})

export async function GET() {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role !== 'tourist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const preferences = await getTouristPreferences(session.userId)
  return NextResponse.json({ preferences })
}

export async function PUT(request: Request) {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role !== 'tourist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const payload = payloadSchema.parse(await request.json())
    const preferences = await saveTouristPreferences(session.userId, payload)
    return NextResponse.json({ preferences })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save preferences'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
