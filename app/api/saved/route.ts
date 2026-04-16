import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/server/auth'
import { listSavedExperiences } from '@/lib/server/marketplace'

export async function GET() {
  const session = await getCurrentSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role !== 'tourist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const experiences = await listSavedExperiences(session.userId)
  return NextResponse.json({ experiences })
}
