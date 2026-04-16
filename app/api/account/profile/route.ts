import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentSession } from '@/lib/server/auth'
import { getOperatorProfileFromStore, getUserFromStore, updateUserProfileInStore } from '@/lib/server/data-store'

const payloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().url(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

export async function GET() {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserFromStore(session.userId)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const operator = session.role === 'operator'
    ? await getOperatorProfileFromStore(session.userId)
    : null

  return NextResponse.json({
    profile: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      phone: operator?.phone ?? '',
      bio: operator?.bio ?? '',
      verificationStatus: operator?.verificationStatus,
      joinDate: operator?.joinDate,
      reviewCount: operator?.reviewCount,
      rating: operator?.rating,
    },
  })
}

export async function PUT(request: Request) {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = payloadSchema.parse(await request.json())
    const user = await updateUserProfileInStore(session.userId, payload)

    return NextResponse.json({ profile: user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save profile'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
