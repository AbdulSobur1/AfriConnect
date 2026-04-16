'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { UserRole } from '@/lib/types'

interface SignInOption {
  id: string
  name: string
  email: string
  role: UserRole
}

interface SessionUser {
  userId: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  redirectTo: string
  onSuccess: (user: SessionUser) => Promise<void> | void
}

export function AuthModal({
  isOpen,
  onOpenChange,
  title,
  description,
  redirectTo,
  onSuccess,
}: AuthModalProps) {
  const [accounts, setAccounts] = useState<SignInOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || accounts.length > 0) {
      return
    }

    let cancelled = false

    async function loadAccounts() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/options', {
          method: 'GET',
          cache: 'no-store',
        })

        const result = (await response.json()) as {
          accounts?: SignInOption[]
          error?: string
        }

        if (!response.ok) {
          throw new Error(result.error || 'Unable to load sign-in options')
        }

        if (!cancelled) {
          setAccounts(result.accounts ?? [])
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : 'Unable to load sign-in options.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadAccounts()

    return () => {
      cancelled = true
    }
  }, [accounts.length, isOpen])

  async function handleSuccess() {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      cache: 'no-store',
    })

    const result = (await response.json()) as { session?: SessionUser | null }

    if (result.session) {
      await onSuccess(result.session)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-background p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/70 bg-muted/40 px-4 py-4 text-left sm:px-6 sm:py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-4 w-4" />
            Premium access
          </div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-3xl border-border/70 bg-primary/5 p-5 shadow-none">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Why sign in?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your session unlocks secure booking, host messaging, saved experiences, and a
              smoother return flow after each action.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full bg-background/70 px-3 py-1">
                Secure checkout
              </Badge>
              <Badge variant="outline" className="rounded-full bg-background/70 px-3 py-1">
                Saved shortlist
              </Badge>
              <Badge variant="outline" className="rounded-full bg-background/70 px-3 py-1">
                Verified hosts
              </Badge>
            </div>
          </Card>

          {isLoading ? (
            <Card className="flex min-h-72 items-center justify-center rounded-3xl border-border/70 text-sm text-muted-foreground">
              Loading sign-in options...
            </Card>
          ) : error ? (
            <Card className="flex min-h-72 items-center justify-center rounded-3xl border-destructive/40 bg-destructive/5 px-6 text-center text-sm text-destructive">
              {error}
            </Card>
          ) : (
            <SignInForm
              accounts={accounts}
              redirectTo={redirectTo}
              title="Choose a demo account"
              description="Use one of the seeded accounts below to continue without leaving the page."
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
