'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface SignInFormProps {
  redirectTo?: string
  title?: string
  description?: string
  onSuccess?: () => Promise<void> | void
}

type AuthMode = 'sign-in' | 'sign-up'
type AccountRole = 'tourist' | 'operator'

export function SignInForm({
  redirectTo = '/',
  title = 'Welcome to AfriConnect',
  description = 'Sign in to manage bookings, save experiences, and message hosts. New here? Create an account in a minute.',
  onSuccess,
}: SignInFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [role, setRole] = useState<AccountRole>('tourist')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (mode === 'sign-up') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      if (name.trim().length < 2) {
        setError('Please enter your full name.')
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          mode === 'sign-in'
            ? {
                mode: 'sign-in',
                email,
                password,
              }
            : {
                mode: 'sign-up',
                name,
                email,
                password,
                role,
              }
        ),
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to continue')
      }

      await onSuccess?.()
      router.push(redirectTo)
      router.refresh()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to continue right now.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant={mode === 'sign-in' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setMode('sign-in')}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={mode === 'sign-up' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setMode('sign-up')}
          >
            Create Account
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'sign-up' && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Account type</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    role === 'tourist'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground'
                  }`}
                  onClick={() => setRole('tourist')}
                >
                  Traveler
                </button>
                <button
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    role === 'operator'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground'
                  }`}
                  onClick={() => setRole('operator')}
                >
                  Host
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{role === 'tourist' ? 'Book and save experiences' : 'List and manage experiences'}</Badge>
              </div>
            </div>
          </>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {mode === 'sign-up' && (
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        )}

        <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
          {isLoading
            ? mode === 'sign-in'
              ? 'Signing in...'
              : 'Creating account...'
            : mode === 'sign-in'
              ? 'Sign In'
              : 'Create Account'}
        </Button>
      </form>
    </div>
  )
}
