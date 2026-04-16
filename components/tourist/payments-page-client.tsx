'use client'

import { Header } from '@/components/common/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TouristPaymentRecord } from '@/lib/types'

export function PaymentsPageClient({ payments }: { payments: TouristPaymentRecord[] }) {
  return (
    <>
      <Header userRole="tourist" userName="Sarah Johnson" />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Payments</h1>
            <p className="mt-2 text-muted-foreground">
              Track charges and refunds across your bookings.
            </p>
          </div>

          <div className="space-y-4">
            {payments.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground">
                No payments yet. Your booking charges will show up here.
              </Card>
            ) : (
              payments.map((payment) => (
                <Card key={payment.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{payment.experienceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString()} | {payment.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {payment.currency} {payment.amount}
                      </p>
                      <Badge variant="outline">{payment.status}</Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}
