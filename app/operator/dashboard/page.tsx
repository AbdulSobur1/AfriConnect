import { Header } from '@/components/common/header'
import { DashboardStats } from '@/components/operator/dashboard-stats'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { requireRole } from '@/lib/server/auth'
import { getOperatorDashboard } from '@/lib/server/marketplace'
import Link from 'next/link'
import { Calendar, Users, TrendingUp, Award, Plus, ArrowRight } from 'lucide-react'

export default async function OperatorDashboardPage() {
  const session = await requireRole('operator', '/operator/dashboard')
  const dashboard = await getOperatorDashboard(session.userId)

  const stats = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Total Bookings',
      value: dashboard.stats.totalBookings,
      trend: 'Across all confirmed and pending trips',
      color: 'primary' as const,
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Upcoming Experiences',
      value: dashboard.stats.upcomingExperiences,
      trend: 'Experiences with future availability',
      color: 'secondary' as const,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Total Guests',
      value: dashboard.stats.totalGuests,
      trend: 'Guests hosted through the platform',
      color: 'accent' as const,
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: 'Rating',
      value: dashboard.stats.rating,
      trend: `${dashboard.stats.reviewCount} reviews`,
      color: 'primary' as const,
    },
  ]

  return (
    <>
      <Header userRole="operator" userName={dashboard.operator.name} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Welcome back, {dashboard.operator.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your experiences and bookings
                </p>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link href="/operator/experiences/new">
                  <Plus className="w-4 h-4" />
                  New Experience
                </Link>
              </Button>
            </div>

            <DashboardStats stats={stats} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Recent Bookings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/operator/bookings" className="flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {dashboard.recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    New bookings will appear here once guests start reserving your experiences.
                  </p>
                ) : (
                  dashboard.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.experienceName}
                          </p>
                        </div>
                        <Badge
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests} guests
                        </span>
                        <span className="font-semibold text-primary">${booking.totalPrice}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Your Experiences</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/operator/experiences" className="flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {dashboard.experiences.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Your published experiences will appear here once they are added.
                  </p>
                ) : (
                  dashboard.experiences.slice(0, 3).map((experience) => {
                    const totalBookedGuests = experience.availability.reduce(
                      (sum, slot) => sum + slot.booked,
                      0
                    )

                    return (
                      <div
                        key={experience.id}
                        className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{experience.title}</p>
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <TrendingUp className="w-4 h-4" />
                              {totalBookedGuests} guests booked - {experience.rating} rating
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/operator/experiences">Manage</Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
