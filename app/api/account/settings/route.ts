import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { getAccountSettingsFromStore, saveAccountSettingsToStore } from '@/lib/server/data-store'

const payloadSchema = z.object({
  marketingEmails: z.boolean(),
  bookingReminders: z.boolean(),
  smsAlerts: z.boolean(),
  language: z.enum(['en', 'fr']),
  currency: z.enum(['USD', 'NGN']),
  profileVisibility: z.enum(['public', 'private']),
})

export async function GET() {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await getAccountSettingsFromStore(session.userId)
  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = payloadSchema.parse(await request.json())
    const settings = await saveAccountSettingsToStore(session.userId, payload)
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save settings'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
