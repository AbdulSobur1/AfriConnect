import { requireRole } from '@/lib/server/auth'
import { getAccountSettingsFromStore } from '@/lib/server/data-store'
import { SettingsPageClient } from '@/components/account/settings-page-client'

export default async function OperatorSettingsPage() {
  const session = await requireRole('operator', '/operator/settings')
  const settings = await getAccountSettingsFromStore(session.userId)

  return <SettingsPageClient role="operator" userName={session.name} settings={settings} />
}
