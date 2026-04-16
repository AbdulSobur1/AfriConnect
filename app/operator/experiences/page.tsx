import { Header } from '@/components/common/header'
import { BackButton } from '@/components/common/back-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExperienceRowActions } from '@/components/operator/experience-row-actions'
import { requireRole } from '@/lib/server/auth'
import { listExperiencesByOperator } from '@/lib/server/marketplace'
import Link from 'next/link'
import { Plus, Edit, Eye, MapPin, Clock, Users } from 'lucide-react'
import Image from 'next/image'

export default async function OperatorExperiencesPage() {
  const session = await requireRole('operator', '/operator/experiences')
  const experiences = await listExperiencesByOperator(session.userId)

  return (
    <>
      <Header userRole="operator" userName={session.name} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <BackButton fallbackHref="/operator/dashboard" />
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">My Experiences</h1>
              <p className="mt-2 text-muted-foreground">Manage and track your listed experiences</p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link href="/operator/experiences/new">
                <Plus className="w-4 h-4" />
                Add Experience
              </Link>
            </Button>
          </div>

          {experiences.length === 0 ? (
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-foreground">No experiences yet</h2>
              <p className="mt-2 text-muted-foreground">
                Create your first experience to start receiving guest bookings.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {experiences.map((experience) => {
                const totalBookedGuests = experience.availability.reduce(
                  (sum, slot) => sum + slot.booked,
                  0
                )

                return (
                  <Card
                    key={experience.id}
                    className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full bg-muted">
                      <Image
                        src={experience.image || '/placeholder.jpg'}
                        alt={experience.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute right-4 top-4">{totalBookedGuests} booked</Badge>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="mb-2 text-lg font-bold text-foreground">{experience.title}</h3>

                      <div className="mb-4 flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {experience.location.city}, {experience.location.region}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {experience.duration} hours
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {experience.groupSize.min}-{experience.groupSize.max} guests
                        </div>
                      </div>

                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">${experience.price}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">{experience.rating}</span>
                          <span className="text-muted-foreground">/5</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Badge variant="outline">{experience.status}</Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <Link href={`/experiences/${experience.id}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <Link href={`/operator/experiences/${experience.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <ExperienceRowActions experienceId={experience.id} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
