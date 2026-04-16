import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createSessionCookieValue,
  getCurrentSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from '@/lib/server/auth'
import { getUserFromStore } from '@/lib/server/data-store'
import { enforceRateLimit } from '@/lib/server/rate-limit'

const signInSchema = z.object({
  userId: z.string().min(1),
})

export async function GET() {
  const session = await getCurrentSession()
  return NextResponse.json({ session })
}

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, 'auth-session-create', { windowMs: 60_000, maxRequests: 12 })

    const payload = signInSchema.parse(await request.json())
    const user = await getUserFromStore(payload.userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const response = NextResponse.json({
      session: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })

    response.cookies.set(
      getSessionCookieName(),
      createSessionCookieValue(user.id),
      getSessionCookieOptions()
    )

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(getSessionCookieName())
  return response
}
