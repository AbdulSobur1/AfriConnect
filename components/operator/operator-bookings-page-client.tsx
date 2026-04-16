'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/common/header'
import { Card } from '@/components/ui/card'
import { BookingRow } from '@/components/operator/booking-row'
import { OperatorBookingRecord } from '@/lib/types'

interface OperatorBookingsPageClientProps {
  operatorName: string
  initialBookings: OperatorBookingRecord[]
}

export function OperatorBookingsPageClient({
  operatorName,
  initialBookings,
}: OperatorBookingsPageClientProps) {
  const [bookings, setBookings] = useState(initialBookings)

  const summary = useMemo(() => {
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
    const pendingCount = bookings.filter((b) => b.status === 'pending').length
    const totalRevenue = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0)

    return { confirmedCount, pendingCount, totalRevenue }
  }, [bookings])

  return (
    <>
      <Header userRole="operator" userName={operatorName} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Bookings</h1>
            <p className="mt-2 text-muted-foreground">Manage and track all guest bookings</p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">Confirmed</p>
              <p className="text-3xl font-bold text-primary">{summary.confirmedCount}</p>
            </Card>
            <Card className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-secondary">{summary.pendingCount}</p>
            </Card>
            <Card className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-accent">${summary.totalRevenue}</p>
            </Card>
          </div>

          <div className="space-y-6">
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No bookings yet</p>
              </Card>
            ) : (
              bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={(updated) => {
                    setBookings((current) =>
                      current.map((item) => (item.id === updated.id ? updated : item))
                    )
                  }}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
