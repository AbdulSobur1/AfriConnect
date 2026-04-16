import { requireRole } from '@/lib/server/auth'
import { getUserFromStore } from '@/lib/server/data-store'
import { ProfilePageClient } from '@/components/account/profile-page-client'

export default async function TouristProfilePage() {
  const session = await requireRole('tourist', '/profile')
  const profile = await getUserFromStore(session.userId)

  if (!profile) {
    throw new Error('Unable to load profile')
  }

  return (
    <ProfilePageClient
      profile={{
        id: profile.id,
        role: 'tourist',
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        createdAt: profile.createdAt,
      }}
    />
  )
}
