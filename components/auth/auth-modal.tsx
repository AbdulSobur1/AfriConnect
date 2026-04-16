'use client'

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

interface SessionUser {
  userId: string
  name: string
  email: string
  role: 'tourist' | 'operator' | 'admin'
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
          <SignInForm
            redirectTo={redirectTo}
            title="Sign in or create your account"
            description="Use your email and password to continue booking, saving, and messaging without leaving the page."
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
