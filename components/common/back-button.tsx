'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref?: string
  label?: string
  className?: string
}

export function BackButton({
  fallbackHref = '/',
  label = 'Go back',
  className,
}: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleBack}
      className={`w-fit rounded-full px-3 text-muted-foreground hover:text-foreground ${className ?? ''}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
