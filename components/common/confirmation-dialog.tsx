'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmationDialogProps {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => Promise<void> | void
  children: (onOpen: () => void) => ReactNode
}

export function ConfirmationDialog({
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  children,
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {children(() => setIsOpen(true))}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-sm w-full p-6 animate-scaleIn">
            <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
            {description && <p className="text-muted-foreground mb-6">{description}</p>}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className={isDangerous ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}
              >
                {isLoading ? 'Loading...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
