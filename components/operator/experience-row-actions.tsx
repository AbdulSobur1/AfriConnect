'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/context/toast-context'

export function ExperienceRowActions({ experienceId }: { experienceId: string }) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/operator/experiences/${experienceId}`, {
        method: 'DELETE',
      })
      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to delete experience')
      }

      addToast('Experience deleted.', 'success')
      router.refresh()
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to delete experience.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
