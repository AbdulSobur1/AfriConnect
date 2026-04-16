import { requireRole } from '@/lib/server/auth'
import { getOperatorProfileFromStore, getUserFromStore } from '@/lib/server/data-store'
import { ProfilePageClient } from '@/components/account/profile-page-client'

export default async function OperatorProfilePage() {
  const session = await requireRole('operator', '/operator/profile')
  const user = await getUserFromStore(session.userId)
  const operator = await getOperatorProfileFromStore(session.userId)

  if (!user || !operator) {
    throw new Error('Unable to load operator profile')
  }

  return (
    <ProfilePageClient
      profile={{
        id: user.id,
        role: 'operator',
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        phone: operator.phone,
        bio: operator.bio,
        verificationStatus: operator.verificationStatus,
        joinDate: operator.joinDate,
        reviewCount: operator.reviewCount,
        rating: operator.rating,
      }}
    />
  )
}
