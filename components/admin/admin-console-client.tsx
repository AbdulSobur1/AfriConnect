'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/context/toast-context'

interface OperatorSummary {
  id: string
  name: string
  email: string
  bio: string
  verificationStatus: 'verified' | 'pending' | 'unverified'
}

interface ExperienceSummary {
  id: string
  title: string
  operatorName: string
  status: 'draft' | 'pending-review' | 'published' | 'archived'
  adminNotes?: string
}

interface DisputeSummary {
  id: string
  bookingId: string
  experienceName: string
  touristName: string
  operatorName: string
  reason: string
  status: 'open' | 'resolved'
  createdAt: string
  resolutionNotes?: string
  resolvedAt?: string
}

export function AdminConsoleClient({
  initialOperators,
  initialExperiences,
  operations,
  emailEvents,
  disputes: initialDisputes,
}: {
  initialOperators: OperatorSummary[]
  initialExperiences: ExperienceSummary[]
  operations: {
    grossRevenue: number
    refundsIssued: number
    activeBookings: number
    emailsSent: number
    openDisputes: number
  }
  emailEvents: Array<{
    id: string
    recipient: string
    subject: string
    category: string
    status: string
    createdAt: string
  }>
  disputes: DisputeSummary[]
}) {
  const { addToast } = useToast()
  const [operators, setOperators] = useState(initialOperators)
  const [experiences, setExperiences] = useState(initialExperiences)
  const [disputes, setDisputes] = useState(initialDisputes)
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({})

  async function updateOperator(id: string, verificationStatus: OperatorSummary['verificationStatus']) {
    const response = await fetch(`/api/admin/operators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus }),
    })
    const result = (await response.json()) as { operator?: OperatorSummary; error?: string }

    if (!response.ok || !result.operator) {
      throw new Error(result.error || 'Unable to update operator')
    }

    setOperators((current) => current.map((item) => (item.id === id ? result.operator! : item)))
  }

  async function updateExperience(id: string, status: ExperienceSummary['status']) {
    const response = await fetch(`/api/admin/experiences/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        adminNotes:
          status === 'published'
            ? 'Approved for public discovery.'
            : status === 'pending-review'
              ? 'Returned to review queue.'
              : status === 'archived'
                ? 'Archived by admin.'
                : 'Saved as draft.',
      }),
    })
    const result = (await response.json()) as {
      experience?: ExperienceSummary
      error?: string
    }

    if (!response.ok || !result.experience) {
      throw new Error(result.error || 'Unable to update experience')
    }

    setExperiences((current) =>
      current.map((item) => (item.id === id ? result.experience! : item))
    )
  }

  async function resolveDisputeCase(id: string) {
    const response = await fetch(`/api/admin/disputes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resolve',
        resolutionNotes: resolutionNotes[id]?.trim() || 'Resolved by admin support.',
      }),
    })
    const result = (await response.json()) as { dispute?: DisputeSummary; error?: string }

    if (!response.ok || !result.dispute) {
      throw new Error(result.error || 'Unable to resolve dispute')
    }

    setDisputes((current) => current.map((item) => (item.id === id ? result.dispute! : item)))
    setResolutionNotes((current) => ({ ...current, [id]: '' }))
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-5">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Gross Revenue</p>
          <p className="mt-2 text-2xl font-bold text-foreground">${operations.grossRevenue}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Refunds Issued</p>
          <p className="mt-2 text-2xl font-bold text-foreground">${operations.refundsIssued}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Active Bookings</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{operations.activeBookings}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Emails Sent</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{operations.emailsSent}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Open Disputes</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{operations.openDisputes}</p>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Operator Verification</h2>
          <p className="text-sm text-muted-foreground">
            Approve or hold operators before their experiences go live globally.
          </p>
        </div>
        <div className="grid gap-4">
          {operators.map((operator) => (
            <Card key={operator.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{operator.name}</h3>
                    <Badge variant="outline">{operator.verificationStatus}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{operator.email}</p>
                  <p className="text-sm text-muted-foreground">{operator.bio}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateOperator(operator.id, 'verified')
                        addToast('Operator verified.', 'success')
                      } catch (error) {
                        addToast(
                          error instanceof Error ? error.message : 'Unable to verify operator.',
                          'error'
                        )
                      }
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateOperator(operator.id, 'pending')
                        addToast('Operator moved back to pending review.', 'info')
                      } catch (error) {
                        addToast(
                          error instanceof Error ? error.message : 'Unable to update operator.',
                          'error'
                        )
                      }
                    }}
                  >
                    Pending
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Experience Moderation</h2>
          <p className="text-sm text-muted-foreground">
            Review submissions, publish approved experiences, and archive anything that should not
            appear publicly.
          </p>
        </div>
        <div className="grid gap-4">
          {experiences.map((experience) => (
            <Card key={experience.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{experience.title}</h3>
                    <Badge>{experience.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Operator: {experience.operatorName}</p>
                  {experience.adminNotes && (
                    <p className="text-sm text-muted-foreground">Admin note: {experience.adminNotes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateExperience(experience.id, 'published')
                        addToast('Experience published.', 'success')
                      } catch (error) {
                        addToast(
                          error instanceof Error ? error.message : 'Unable to publish experience.',
                          'error'
                        )
                      }
                    }}
                  >
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateExperience(experience.id, 'pending-review')
                        addToast('Experience returned to pending review.', 'info')
                      } catch (error) {
                        addToast(
                          error instanceof Error ? error.message : 'Unable to update experience.',
                          'error'
                        )
                      }
                    }}
                  >
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await updateExperience(experience.id, 'archived')
                        addToast('Experience archived.', 'warning')
                      } catch (error) {
                        addToast(
                          error instanceof Error ? error.message : 'Unable to archive experience.',
                          'error'
                        )
                      }
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dispute Queue</h2>
          <p className="text-sm text-muted-foreground">
            Handle guest issues before they turn into trust and reputation problems.
          </p>
        </div>
        <div className="grid gap-4">
          {disputes.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">
              No disputes have been reported yet.
            </Card>
          ) : (
            disputes.map((dispute) => (
              <Card key={dispute.id} className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{dispute.experienceName}</h3>
                        <Badge variant="outline">{dispute.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tourist: {dispute.touristName} | Operator: {dispute.operatorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reported {new Date(dispute.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground">
                    {dispute.reason}
                  </div>
                  {dispute.status === 'resolved' ? (
                    <p className="text-sm text-muted-foreground">
                      Resolved{' '}
                      {dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString() : ''}
                      {dispute.resolutionNotes ? ` | ${dispute.resolutionNotes}` : ''}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 md:flex-row">
                      <Input
                        value={resolutionNotes[dispute.id] ?? ''}
                        onChange={(event) =>
                          setResolutionNotes((current) => ({
                            ...current,
                            [dispute.id]: event.target.value,
                          }))
                        }
                        placeholder="Add a resolution note for the tourist and operator"
                      />
                      <Button
                        onClick={async () => {
                          try {
                            await resolveDisputeCase(dispute.id)
                            addToast('Dispute resolved.', 'success')
                          } catch (error) {
                            addToast(
                              error instanceof Error ? error.message : 'Unable to resolve dispute.',
                              'error'
                            )
                          }
                        }}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Email Activity</h2>
          <p className="text-sm text-muted-foreground">
            Recent transactional email events generated by bookings, disputes, and cancellations.
          </p>
        </div>
        <div className="grid gap-4">
          {emailEvents.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{event.subject}</p>
                  <p className="text-sm text-muted-foreground">{event.recipient}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{event.category}</Badge>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
