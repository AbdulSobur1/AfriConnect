'use client'

import { useState } from 'react'
import { Header } from '@/components/common/header'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { BookingCard } from '@/components/tourist/booking-card'
import { TouristBookingRecord } from '@/lib/types'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

interface TouristBookingsPageClientProps {
  initialBookings: TouristBookingRecord[]
}

export function TouristBookingsPageClient({
  initialBookings,
}: TouristBookingsPageClientProps) {
  const [bookings, setBookings] = useState(initialBookings)

  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-4xl font-bold text-foreground">My Bookings</h1>

          {bookings.length === 0 ? (
            <Empty
              icon={Calendar}
              title="No Bookings Yet"
              description="You haven&apos;t booked any experiences yet. Let&apos;s find your perfect cultural adventure!"
              action={
                <Button asChild>
                  <Link href="/experiences">Explore Experiences</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onBookingUpdated={(updated) => {
                    setBookings((current) =>
                      current.map((item) => (item.id === updated.id ? updated : item))
                    )
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
