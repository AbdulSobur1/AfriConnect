'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

export interface OperatorBooking {
  id: string
  experienceId: string
  guestName: string
  guestEmail: string
  bookingDate: string
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes: string
  bookedAt: string
}

interface OperatorContextType {
  operatorBookings: OperatorBooking[]
  updateBookingStatus: (bookingId: string, status: OperatorBooking['status']) => void
  updateBookingNotes: (bookingId: string, notes: string) => void
  getBookingsByExperienceId: (experienceId: string) => OperatorBooking[]
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined)

export function OperatorProvider({ children }: { children: ReactNode }) {
  // Initialize with some sample operator bookings
  const defaultBookings: OperatorBooking[] = [
    {
      id: 'op_booking_1',
      experienceId: 'exp_001',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      bookingDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
      guests: 2,
      totalPrice: 150,
      status: 'confirmed',
      notes: 'Guest requested early start time',
      bookedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
      id: 'op_booking_2',
      experienceId: 'exp_001',
      guestName: 'Michael Chen',
      guestEmail: 'michael@example.com',
      bookingDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      guests: 1,
      totalPrice: 75,
      status: 'pending',
      notes: '',
      bookedAt: new Date().toISOString(),
    },
    {
      id: 'op_booking_3',
      experienceId: 'exp_002',
      guestName: 'Amara Okonkwo',
      guestEmail: 'amara@example.com',
      bookingDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
      guests: 4,
      totalPrice: 480,
      status: 'completed',
      notes: 'Wonderful group, very engaged',
      bookedAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    },
  ]

  const [operatorBookings, setOperatorBookings] = useLocalStorage<OperatorBooking[]>(
    'afri_operator_bookings',
    defaultBookings
  )

  const updateBookingStatus = (bookingId: string, status: OperatorBooking['status']) => {
    setOperatorBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    )
  }

  const updateBookingNotes = (bookingId: string, notes: string) => {
    setOperatorBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, notes } : b))
    )
  }

  const getBookingsByExperienceId = (experienceId: string) => {
    return operatorBookings.filter((b) => b.experienceId === experienceId)
  }

  return (
    <OperatorContext.Provider
      value={{
        operatorBookings,
        updateBookingStatus,
        updateBookingNotes,
        getBookingsByExperienceId,
      }}
    >
      {children}
    </OperatorContext.Provider>
  )
}

export function useOperator() {
  const context = useContext(OperatorContext)
  if (context === undefined) {
    throw new Error('useOperator must be used within OperatorProvider')
  }
  return context
}
