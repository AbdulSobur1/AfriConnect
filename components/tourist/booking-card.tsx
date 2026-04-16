'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TouristBookingRecord } from '@/lib/types'
import { Calendar, Users, DollarSign, AlertCircle } from 'lucide-react'
import { useToast } from '@/context/toast-context'
import Link from 'next/link'

interface BookingCardProps {
  booking: TouristBookingRecord
  onBookingUpdated?: (booking: TouristBookingRecord) => void
}

export function BookingCard({ booking, onBookingUpdated }: BookingCardProps) {
  const { addToast } = useToast()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [issueReason, setIssueReason] = useState('')

  const handleCancel = async () => {
    setIsCancelling(true)

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      })

      const result = (await response.json()) as {
        booking?: TouristBookingRecord
        error?: string
      }

      if (!response.ok || !result.booking) {
        throw new Error(result.error || 'Unable to cancel booking')
      }

      onBookingUpdated?.(result.booking)
      addToast(`Booking cancelled for ${booking.experienceName}`, 'info')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to cancel booking.', 'error')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReportIssue = async () => {
    setIsReporting(true)

    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          reason: issueReason,
        }),
      })

      const result = (await response.json()) as {
        booking?: TouristBookingRecord
        error?: string
      }

      if (!response.ok || !result.booking) {
        throw new Error(result.error || 'Unable to report issue')
      }

      onBookingUpdated?.(result.booking)
      setIssueReason('')
      setShowReportForm(false)
      addToast('Support request sent to admin.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to report issue.', 'error')
    } finally {
      setIsReporting(false)
    }
  }

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    reviewed: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  }

  const bookingDate = new Date(booking.bookingDate)
  const isUpcoming = bookingDate > new Date()
  const isCancelled = booking.status === 'cancelled'

  return (
    <div
      className={`rounded-lg border border-border bg-card p-6 transition-opacity ${
        isCancelled ? 'opacity-60' : ''
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            <Link
              href={`/experiences/${booking.experienceId}`}
              className="transition-colors hover:text-primary"
            >
              {booking.experienceName}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">by {booking.operatorName}</p>
        </div>
        <Badge className={statusColors[booking.status]}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      {booking.dispute && (
        <div className="mb-4">
          <Badge variant="outline">
            {booking.dispute.status === 'open' ? 'Issue Under Review' : 'Issue Resolved'}
          </Badge>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4 border-y border-border py-4">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
            <p className="font-semibold text-foreground">
              {bookingDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Guests</p>
            <p className="font-semibold text-foreground">
              {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <DollarSign className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="font-semibold text-primary">${booking.totalPrice}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/experiences/${booking.experienceId}`}>View Details</Link>
        </Button>
        {(!booking.dispute || booking.dispute.status === 'resolved') && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowReportForm((current) => !current)}
          >
            {booking.dispute?.status === 'resolved' ? 'Report Follow-up' : 'Report Issue'}
          </Button>
        )}
        {!isCancelled && isUpcoming && (
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        )}
      </div>

      {showReportForm && (
        <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
          <div>
            <p className="font-medium text-foreground">Tell admin what went wrong</p>
            <p className="text-sm text-muted-foreground">
              Share enough detail for support to review the booking properly.
            </p>
          </div>
          <Textarea
            value={issueReason}
            onChange={(event) => setIssueReason(event.target.value)}
            placeholder="Example: the operator changed the meeting point and stopped responding."
            className="min-h-24"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleReportIssue}
              disabled={isReporting || issueReason.trim().length < 10}
            >
              {isReporting ? 'Sending...' : 'Send to Admin'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowReportForm(false)
                setIssueReason('')
              }}
              disabled={isReporting}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">
            This booking has been cancelled.
          </p>
        </div>
      )}
    </div>
  )
}
