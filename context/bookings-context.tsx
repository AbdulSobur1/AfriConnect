'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

export interface UserBooking {
  id: string
  experienceId: string
  experienceName: string
  operatorName: string
  bookingDate: string
  guests: number
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled'
  bookedAt: string
}

interface BookingsContextType {
  bookings: UserBooking[]
  addBooking: (booking: UserBooking) => void
  cancelBooking: (bookingId: string) => void
  getBookingsByExperienceId: (experienceId: string) => UserBooking[]
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useLocalStorage<UserBooking[]>('afri_user_bookings', [])

  const addBooking = (booking: UserBooking) => {
    setBookings((prev) => [...prev, booking])
  }

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    )
  }

  const getBookingsByExperienceId = (experienceId: string) => {
    return bookings.filter((b) => b.experienceId === experienceId && b.status !== 'cancelled')
  }

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        getBookingsByExperienceId,
      }}
    >
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingsContext)
  if (context === undefined) {
    throw new Error('useBookings must be used within BookingsProvider')
  }
  return context
}
