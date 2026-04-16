'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AuthModal } from '@/components/auth/auth-modal'
import { useToast } from '@/context/toast-context'
import { UserRole } from '@/lib/types'

interface SessionUser {
  userId: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthIntent {
  title: string
  description: string
}

interface AuthRequiredContextValue {
  sessionUser: SessionUser | null
  setSessionUser: (user: SessionUser | null) => void
  ensureSignedIn: (intent: AuthIntent, action: () => void | Promise<void>) => Promise<boolean>
  openAuthModal: (intent?: Partial<AuthIntent>) => void
}

const AuthRequiredContext = createContext<AuthRequiredContextValue | null>(null)

const defaultIntent: AuthIntent = {
  title: 'Continue with AfriConnect',
  description: 'Sign in to save experiences, message hosts, and complete secure bookings.',
}

export function AuthRequiredProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { addToast } = useToast()
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [intent, setIntent] = useState<AuthIntent>(defaultIntent)
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null)

  const openAuthModal = useCallback((nextIntent?: Partial<AuthIntent>) => {
    setPendingAction(null)
    setIntent({
      title: nextIntent?.title ?? defaultIntent.title,
      description: nextIntent?.description ?? defaultIntent.description,
    })
    setIsModalOpen(true)
  }, [])

  const ensureSignedIn = useCallback(
    async (nextIntent: AuthIntent, action: () => void | Promise<void>) => {
      if (sessionUser) {
        await action()
        return true
      }

      setIntent(nextIntent)
      setPendingAction(() => action)
      setIsModalOpen(true)
      return false
    },
    [sessionUser]
  )

  const handleAuthSuccess = useCallback(
    async (user: SessionUser) => {
      setSessionUser(user)
      setIsModalOpen(false)

      if (!pendingAction) {
        return
      }

      const action = pendingAction
      setPendingAction(null)

      try {
        await action()
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : 'Unable to continue your action.',
          'error'
        )
      }
    },
    [addToast, pendingAction]
  )

  const value = useMemo(
    () => ({
      sessionUser,
      setSessionUser,
      ensureSignedIn,
      openAuthModal,
    }),
    [ensureSignedIn, openAuthModal, sessionUser]
  )

  return (
    <AuthRequiredContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)

          if (!open) {
            setPendingAction(null)
          }
        }}
        title={intent.title}
        description={intent.description}
        redirectTo={pathname || '/'}
        onSuccess={handleAuthSuccess}
      />
    </AuthRequiredContext.Provider>
  )
}

export function useAuthRequired() {
  const context = useContext(AuthRequiredContext)

  if (!context) {
    throw new Error('useAuthRequired must be used within AuthRequiredProvider')
  }

  return context
}
