import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createSessionCookieValue,
  getCurrentSession,
  getSessionCookieName,
  getSessionCookieOptions,
} from '@/lib/server/auth'
import { createUserInStore, findUserByEmailFromStore } from '@/lib/server/data-store'
import { enforceRateLimit } from '@/lib/server/rate-limit'
import { verifyPassword } from '@/lib/server/password'

const signUpSchema = z.object({
  mode: z.literal('sign-up'),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['tourist', 'operator']).default('tourist'),
})

const authSchema = z.union([
  z.object({
    mode: z.literal('sign-in'),
    email: z.string().email(),
    password: z.string().min(8),
  }),
  signUpSchema,
])

export async function GET() {
  const session = await getCurrentSession()
  return NextResponse.json({ session })
}

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, 'auth-session-create', { windowMs: 60_000, maxRequests: 12 })

    const payload = authSchema.parse(await request.json())
    const user =
      payload.mode === 'sign-up'
        ? await createUserInStore({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role,
          })
        : await findUserByEmailFromStore(payload.email)

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (payload.mode === 'sign-in') {
      const valid = verifyPassword(payload.password, user.passwordHash)

      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
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
