'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/context/toast-context'

interface SettingsPageClientProps {
  role: 'tourist' | 'operator'
  userName: string
  settings: {
    marketingEmails: boolean
    bookingReminders: boolean
    smsAlerts: boolean
    language: 'en' | 'fr'
    currency: 'USD' | 'NGN'
    profileVisibility: 'public' | 'private'
  }
}

export function SettingsPageClient({ role, userName, settings }: SettingsPageClientProps) {
  const { addToast } = useToast()
  const [form, setForm] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)

    try {
      const response = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save settings')
      }

      addToast('Settings updated successfully.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to save settings.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Header userRole={role === 'operator' ? 'operator' : 'tourist'} userName={userName} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Account settings
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Control how AfriConnect works for you
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Update notifications, privacy, and regional preferences from one place.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[28px] border-border/70 p-6 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/35 p-4">
                  <div>
                    <p className="font-semibold text-foreground">Marketing emails</p>
                    <p className="text-sm text-muted-foreground">Receive product updates and destination highlights.</p>
                  </div>
                  <Switch
                    checked={form.marketingEmails}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, marketingEmails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/35 p-4">
                  <div>
                    <p className="font-semibold text-foreground">Booking reminders</p>
                    <p className="text-sm text-muted-foreground">Get timely updates before booked experiences.</p>
                  </div>
                  <Switch
                    checked={form.bookingReminders}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, bookingReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/35 p-4">
                  <div>
                    <p className="font-semibold text-foreground">SMS alerts</p>
                    <p className="text-sm text-muted-foreground">Receive urgent booking updates by SMS.</p>
                  </div>
                  <Switch
                    checked={form.smsAlerts}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, smsAlerts: checked }))}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Language</Label>
                    <Select
                      value={form.language}
                      onValueChange={(value: 'en' | 'fr') => setForm((prev) => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Currency</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(value: 'USD' | 'NGN') => setForm((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Profile visibility</Label>
                  <Select
                    value={form.profileVisibility}
                    onValueChange={(value: 'public' | 'private') =>
                      setForm((prev) => ({ ...prev, profileVisibility: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-full sm:w-auto">
                  {isSaving ? 'Saving...' : 'Save settings'}
                </Button>
              </div>
            </Card>

            <Card className="rounded-[28px] border-border/70 p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Quick links</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Jump to the parts of the platform you are most likely to revisit while managing your account.
                  </p>
                </div>

                {role === 'tourist' ? (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/quiz">Update travel preferences</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/saved">Review saved experiences</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/bookings">View bookings</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/operator/experiences">Manage experiences</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/operator/bookings">Review bookings</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full rounded-full justify-start">
                      <Link href="/operator/dashboard">Open dashboard</Link>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
