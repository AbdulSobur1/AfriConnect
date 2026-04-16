import { NextResponse } from 'next/server'
import { listUsersFromStore } from '@/lib/server/data-store'

export async function GET() {
  const users = await listUsersFromStore()

  return NextResponse.json({
    accounts: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })),
  })
}
