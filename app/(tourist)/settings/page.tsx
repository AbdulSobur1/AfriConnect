import { requireRole } from '@/lib/server/auth'
import { getAccountSettingsFromStore } from '@/lib/server/data-store'
import { SettingsPageClient } from '@/components/account/settings-page-client'

export default async function TouristSettingsPage() {
  const session = await requireRole('tourist', '/settings')
  const settings = await getAccountSettingsFromStore(session.userId)

  return <SettingsPageClient role="tourist" userName={session.name} settings={settings} />
}
