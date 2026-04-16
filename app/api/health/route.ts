import { NextResponse } from 'next/server'
import { readAppData } from '@/lib/server/data-store'

export async function GET() {
  try {
    const data = await readAppData()
    const openDisputes = data.disputes.filter((dispute) => dispute.status === 'open').length
    const activeBookings = data.bookings.filter((booking) => booking.status !== 'cancelled').length

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      metrics: {
        users: data.users.length,
        operators: data.operators.length,
        experiences: data.experiences.length,
        bookings: data.bookings.length,
        activeBookings,
        payments: data.payments.length,
        openDisputes,
        emailEvents: data.emailEvents.length,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed'
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    )
  }
}
