'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/context/toast-context'

interface ProfilePageClientProps {
  profile: {
    id: string
    role: 'tourist' | 'operator' | 'admin'
    name: string
    email: string
    avatar?: string
    createdAt: string
    phone?: string
    bio?: string
    verificationStatus?: string
    joinDate?: string
    reviewCount?: number
    rating?: number
  }
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || 'https://i.pravatar.cc/300?img=15',
    phone: profile.phone || '',
    bio: profile.bio || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save profile')
      }

      addToast('Profile updated successfully.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to save profile.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Header userRole={profile.role === 'operator' ? 'operator' : 'tourist'} userName={profile.name} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              {profile.role === 'operator' ? 'Operator profile' : 'Traveler profile'}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Manage your public account details
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Keep your name, avatar, and contact details up to date so your AfriConnect account feels complete and trustworthy.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[28px] border-border/70 p-6 shadow-sm">
              <div className="flex flex-col items-start gap-5">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-muted">
                  <Image src={form.avatar} alt={form.name} fill className="object-cover" sizes="96px" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{form.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{form.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {profile.role}
                  </Badge>
                  {profile.verificationStatus && (
                    <Badge variant="outline" className="capitalize">
                      {profile.verificationStatus}
                    </Badge>
                  )}
                </div>
                {profile.role === 'operator' && (
                  <div className="grid w-full gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
                    <p className="text-muted-foreground">
                      Rating: <span className="font-semibold text-foreground">{profile.rating?.toFixed(1) ?? 'New'}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Reviews: <span className="font-semibold text-foreground">{profile.reviewCount ?? 0}</span>
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(profile.joinDate || profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>

            <Card className="rounded-[28px] border-border/70 p-6 shadow-sm">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={form.avatar}
                    onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                  />
                </div>
                {profile.role === 'operator' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Host bio</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                        className="min-h-32"
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-full sm:w-auto">
                    {isSaving ? 'Saving...' : 'Save profile'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
