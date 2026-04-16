'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Experience } from '@/lib/types'
import { useToast } from '@/context/toast-context'

interface BookingModalProps {
  experience: Experience
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BookingModal({
  experience,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [bookingDate, setBookingDate] = useState('')
  const [guests, setGuests] = useState('1')
  const [isLoading, setIsLoading] = useState(false)

  const guestCount = Number.parseInt(guests, 10)
  const totalPrice = experience.price * guestCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingDate) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experienceId: experience.id,
          bookingDate,
          guests: guestCount,
        }),
      })

      const result = (await response.json()) as { error?: string }

      if (response.status === 401) {
        router.push(`/sign-in?redirectTo=${encodeURIComponent(`/experiences/${experience.id}`)}`)
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to create booking')
      }

      addToast(`Booking confirmed for ${experience.title}!`, 'success')
      onClose()
      onSuccess?.()
      router.refresh()
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Unable to create booking right now.',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Experience</DialogTitle>
          <DialogDescription>{experience.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="booking-date">Select Date *</Label>
            <Select value={bookingDate} onValueChange={setBookingDate}>
              <SelectTrigger id="booking-date">
                <SelectValue placeholder="Choose a date" />
              </SelectTrigger>
              <SelectContent>
                {experience.availability.map((slot) => {
                  const remainingSpots = slot.spotsAvailable - slot.booked
                  const dateValue = new Date(slot.date).toISOString().slice(0, 10)

                  return (
                    <SelectItem
                      key={slot.id}
                      value={dateValue}
                      disabled={remainingSpots <= 0}
                    >
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      ({remainingSpots} left)
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests *</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger id="guests">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: experience.groupSize.max - experience.groupSize.min + 1 },
                  (_, index) => experience.groupSize.min + index
                ).map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="mb-2 flex justify-between">
              <span className="text-sm">Price per person</span>
              <span className="text-sm font-medium">${experience.price}</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-sm">Number of guests</span>
              <span className="text-sm font-medium">{guestCount}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Total Price</span>
              <span className="font-semibold text-primary">${totalPrice}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!bookingDate || isLoading}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
