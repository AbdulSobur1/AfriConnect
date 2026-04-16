import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/types'
import { getUserFromStore } from '@/lib/server/data-store'

const SESSION_COOKIE_NAME = 'africonnect_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

interface SessionPayload {
  userId: string
  expiresAt: number
}

export interface AppSession {
  userId: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

function getSessionSecret() {
  return process.env.AUTH_SECRET || 'africonnect-dev-secret'
}

function signValue(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex')
}

function encodePayload(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = signValue(body)
  return `${body}.${signature}`
}

function decodePayload(value: string): SessionPayload | null {
  const [body, signature] = value.split('.')

  if (!body || !signature) {
    return null
  }

  const expectedSignature = signValue(body)

  const isValid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )

  if (!isValid) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload

    if (payload.expiresAt <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function createSessionCookieValue(userId: string) {
  return encodePayload({
    userId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  })
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!raw) {
    return null
  }

  const payload = decodePayload(raw)

  if (!payload) {
    return null
  }

  const user = await getUserFromStore(payload.userId)

  if (!user) {
    return null
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}

export async function requireSession(redirectTo?: string) {
  const session = await getCurrentSession()

  if (!session) {
    const target = redirectTo ? encodeURIComponent(redirectTo) : encodeURIComponent('/')
    redirect(`/sign-in?redirectTo=${target}`)
  }

  return session
}

export async function requireRole(role: UserRole, redirectTo?: string) {
  const session = await requireSession(redirectTo)

  if (session.role !== role) {
    redirect(getRoleHomePath(session.role))
  }

  return session
}

export function getRoleHomePath(role: UserRole) {
  if (role === 'operator') return '/operator/dashboard'
  if (role === 'admin') return '/admin'
  return '/'
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}
