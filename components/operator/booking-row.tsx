'use client'

import { useState } from 'react'
import { useToast } from '@/context/toast-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { OperatorBookingRecord } from '@/lib/types'
import { Calendar, Mail, Users } from 'lucide-react'

interface BookingRowProps {
  booking: OperatorBookingRecord
  onBookingUpdated?: (booking: OperatorBookingRecord) => void
}

export function BookingRow({ booking, onBookingUpdated }: BookingRowProps) {
  const { addToast } = useToast()
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState(booking.notes)
  const [isSaving, setIsSaving] = useState(false)

  const saveChanges = async (changes: {
    status?: OperatorBookingRecord['status']
    notes?: string
  }) => {
    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'operator-update',
        ...changes,
      }),
    })

    const result = (await response.json()) as {
      booking?: OperatorBookingRecord
      error?: string
    }

    if (!response.ok || !result.booking) {
      throw new Error(result.error || 'Unable to update booking')
    }

    onBookingUpdated?.(result.booking)
    setNotes(result.booking.notes)
    return result.booking
  }

  const handleStatusChange = async (status: OperatorBookingRecord['status']) => {
    try {
      await saveChanges({ status })
      addToast(`Booking status updated to ${status.replace('-', ' ')}`, 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to update status.', 'error')
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)

    try {
      await saveChanges({ notes })
      setIsEditingNotes(false)
      addToast('Notes saved successfully', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to save notes.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const bookingDate = new Date(booking.bookingDate)

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">{booking.guestName}</h3>
          <p className="text-sm text-muted-foreground">{booking.experienceName}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {booking.guestEmail}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {bookingDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
            </div>
          </div>
        </div>
        <Badge className={statusColors[booking.status]}>
          {booking.status.replace('-', ' ').charAt(0).toUpperCase() +
            booking.status.slice(1).replace('-', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
            Status
          </label>
          <Select value={booking.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
            Total Price
          </label>
          <div className="rounded-md bg-background p-2 text-sm font-semibold text-primary">
            ${booking.totalPrice}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</label>
          {isEditingNotes && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditingNotes(false)
                  setNotes(booking.notes)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
        {isEditingNotes ? (
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this booking..."
            className="bg-background"
          />
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="cursor-pointer rounded-md bg-background p-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            {booking.notes || 'Click to add notes...'}
          </div>
        )}
      </div>
    </div>
  )
}
