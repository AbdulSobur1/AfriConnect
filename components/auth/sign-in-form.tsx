'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRole } from '@/lib/types'

interface SignInOption {
  id: string
  name: string
  email: string
  role: UserRole
}

interface SignInFormProps {
  accounts: SignInOption[]
  redirectTo?: string
  title?: string
  description?: string
  onSuccess?: () => Promise<void> | void
}

const roleLabels: Record<UserRole, string> = {
  tourist: 'Tourist',
  operator: 'Operator',
  admin: 'Admin',
}

export function SignInForm({
  accounts,
  redirectTo = '/',
  title = 'Access AfriConnect',
  description = 'Sign in to manage bookings, access operator tools, and continue building the platform.',
  onSuccess,
}: SignInFormProps) {
  const router = useRouter()
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(userId: string) {
    setLoadingUserId(userId)
    setError(null)

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to sign in')
      }

      await onSuccess?.()
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.')
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <div className="space-y-4">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className="flex items-center justify-between gap-4 rounded-2xl border-border/70 p-4 shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{account.name}</p>
                <Badge variant="outline">{roleLabels[account.role]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{account.email}</p>
            </div>
            <Button
              onClick={() => handleSignIn(account.id)}
              disabled={loadingUserId === account.id}
            >
              {loadingUserId === account.id ? 'Signing in...' : 'Sign In'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
