import 'server-only'

import {
  CreateBookingInput,
  BookingManagementStatus,
  OperatorBookingRecord,
  TouristBookingRecord,
  ExperienceStatus,
  ExperienceUpsertInput,
  OnboardingQuizResponse,
  TouristPaymentRecord,
  AdminDisputeRecord,
} from '@/lib/types'
import {
  getDefaultViewerIds,
  getExperienceFromStore,
  getOperatorProfileFromStore,
  listDisputesFromStore,
  listExperiencesFromStore,
  listEmailEventsFromStore,
  listOperatorBookingsFromStore,
  listOperatorProfilesFromStore,
  listPaymentsFromStore,
  listTouristBookingsFromStore,
  listUsersFromStore,
  updateAppData,
} from '@/lib/server/data-store'
import { hasDatabaseUrl, prisma } from '@/lib/server/db'

export async function listExperiences() {
  const experiences = await listExperiencesFromStore()
  return experiences.filter(
    (experience) =>
      experience.status === 'published' &&
      experience.operator.verificationStatus === 'verified'
  )
}

export async function listExperiencesByOperator(operatorId: string) {
  const experiences = await listExperiencesFromStore()
  return experiences.filter((experience) => experience.operatorId === operatorId)
}

export async function listExperiencesForAdmin() {
  return listExperiencesFromStore()
}

export async function getExperienceById(id: string) {
  const experience = await getExperienceFromStore(id)

  if (
    !experience ||
    experience.status !== 'published' ||
    experience.operator.verificationStatus !== 'verified'
  ) {
    return null
  }

  return experience
}

export async function getOperatorExperienceById(id: string, operatorId: string) {
  const experience = await getExperienceFromStore(id)

  if (!experience || experience.operatorId !== operatorId) {
    return null
  }

  return experience
}

export async function getExperienceForAdmin(id: string) {
  return getExperienceFromStore(id)
}

export async function listTouristBookings(touristId?: string) {
  return listTouristBookingsFromStore(touristId)
}

export async function listOperatorBookings(operatorId?: string) {
  return listOperatorBookingsFromStore(operatorId)
}

export async function listTouristPayments(touristId: string) {
  const [payments, experiences] = await Promise.all([
    listPaymentsFromStore(),
    listExperiencesFromStore(),
  ])
  const experiencesById = new Map(experiences.map((experience) => [experience.id, experience]))

  return payments
    .filter((payment) => payment.touristId === touristId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((payment): TouristPaymentRecord => ({
      id: payment.id,
      bookingId: payment.bookingId,
      experienceName: experiencesById.get(payment.experienceId)?.title ?? 'Experience',
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      createdAt: payment.createdAt,
    }))
}

export async function listEmailEvents() {
  return listEmailEventsFromStore()
}

export async function listAdminDisputes() {
  const [disputes, bookings, users, operators] = await Promise.all([
    listDisputesFromStore(),
    listTouristBookingsFromStore(),
    listUsersFromStore(),
    listOperatorProfilesFromStore(),
  ])
  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]))
  const usersById = new Map(users.map((user) => [user.id, user]))
  const operatorsById = new Map(operators.map((operator) => [operator.id, operator]))

  return disputes
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((dispute): AdminDisputeRecord => {
      const booking = bookingsById.get(dispute.bookingId)
      const tourist = usersById.get(dispute.touristId)
      const operator = operatorsById.get(dispute.operatorId)

      return {
        id: dispute.id,
        bookingId: dispute.bookingId,
        experienceName: booking?.experienceName ?? 'Experience',
        touristName: tourist?.name ?? 'Tourist',
        operatorName: operator?.name ?? 'Operator',
        reason: dispute.reason,
        status: dispute.status,
        createdAt: dispute.createdAt,
        resolutionNotes: dispute.resolutionNotes,
        resolvedAt: dispute.resolvedAt,
      }
    })
}

export async function listSavedExperiences(touristId: string) {
  const experiences = await listExperiences()
  const { readAppData } = await import('@/lib/server/data-store')
  const data = await readAppData()
  const user = data.users.find((item) => item.id === touristId)
  const savedIds = new Set(user?.savedExperienceIds ?? [])
  return experiences.filter((experience) => savedIds.has(experience.id))
}

export async function isExperienceSaved(touristId: string, experienceId: string) {
  const { readAppData } = await import('@/lib/server/data-store')
  const data = await readAppData()
  const user = data.users.find((item) => item.id === touristId)
  return (user?.savedExperienceIds ?? []).includes(experienceId)
}

export async function getTouristPreferences(touristId: string) {
  const { readAppData } = await import('@/lib/server/data-store')
  const data = await readAppData()
  const user = data.users.find((item) => item.id === touristId)
  return user?.onboardingPreferences ?? null
}

export async function saveTouristPreferences(
  touristId: string,
  preferences: OnboardingQuizResponse
) {
  if (hasDatabaseUrl()) {
    const existing = await prisma.user.findUnique({
      where: { id: touristId },
      select: { id: true },
    })

    if (!existing) {
      throw new Error('User not found')
    }

    await prisma.user.update({
      where: { id: touristId },
      data: {
        onboardingPreferences: JSON.parse(JSON.stringify(preferences)),
      },
    })

    return preferences
  }

  return updateAppData(async (data) => {
    const user = data.users.find((item) => item.id === touristId)

    if (!user) {
      throw new Error('User not found')
    }

    user.onboardingPreferences = preferences
    return preferences
  })
}

export async function saveExperience(touristId: string, experienceId: string) {
  const experience = await getExperienceById(experienceId)

  if (!experience) {
    throw new Error('Experience not found')
  }

  if (hasDatabaseUrl()) {
    const user = await prisma.user.findUnique({
      where: { id: touristId },
      select: { id: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.savedExperience.upsert({
      where: {
        touristId_experienceId: {
          touristId,
          experienceId,
        },
      },
      update: {},
      create: {
        touristId,
        experienceId,
      },
    })

    return { saved: true }
  }

  return updateAppData(async (data) => {
    const user = data.users.find((item) => item.id === touristId)

    if (!user) {
      throw new Error('User not found')
    }

    user.savedExperienceIds = Array.from(
      new Set([...(user.savedExperienceIds ?? []), experienceId])
    )

    return { saved: true }
  })
}

export async function unsaveExperience(touristId: string, experienceId: string) {
  if (hasDatabaseUrl()) {
    const user = await prisma.user.findUnique({
      where: { id: touristId },
      select: { id: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.savedExperience.deleteMany({
      where: {
        touristId,
        experienceId,
      },
    })

    return { saved: false }
  }

  return updateAppData(async (data) => {
    const user = data.users.find((item) => item.id === touristId)

    if (!user) {
      throw new Error('User not found')
    }

    user.savedExperienceIds = (user.savedExperienceIds ?? []).filter((id) => id !== experienceId)

    return { saved: false }
  })
}

export async function createBooking(
  input: CreateBookingInput,
  touristId = getDefaultViewerIds().touristId
): Promise<TouristBookingRecord> {
  const experience = await getExperienceFromStore(input.experienceId)

  if (!experience) {
    throw new Error('Experience not found')
  }

  const availableSlot = experience.availability.find(
    (slot) => new Date(slot.date).toISOString().slice(0, 10) === input.bookingDate
  )

  if (!availableSlot) {
    throw new Error('Selected date is no longer available')
  }

  const remainingSpots = availableSlot.spotsAvailable - availableSlot.booked

  if (input.guests < experience.groupSize.min || input.guests > experience.groupSize.max) {
    throw new Error('Guest count is outside the allowed range')
  }

  if (input.guests > remainingSpots) {
    throw new Error('Not enough spots remaining for that date')
  }

  if (hasDatabaseUrl()) {
    const now = new Date()
    const bookingId = `booking-${Date.now()}`
    const paymentId = `payment-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findFirst({
        where: {
          experienceId: experience.id,
          date: {
            gte: new Date(`${input.bookingDate}T00:00:00.000Z`),
            lt: new Date(`${input.bookingDate}T23:59:59.999Z`),
          },
        },
      })

      if (!slot) {
        throw new Error('Selected date is no longer available')
      }

      const remaining = slot.spotsAvailable - slot.booked

      if (input.guests > remaining) {
        throw new Error('Not enough spots remaining for that date')
      }

      await tx.booking.create({
        data: {
          id: bookingId,
          experienceId: experience.id,
          touristId,
          bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`),
          guests: input.guests,
          totalPrice: experience.price * input.guests,
          status: 'confirmed',
          notes: '',
          bookedAt: now,
          updatedAt: now,
        },
      })

      await tx.payment.create({
        data: {
          id: paymentId,
          bookingId,
          experienceId: experience.id,
          touristId,
          operatorId: experience.operatorId,
          amount: experience.price * input.guests,
          currency: experience.currency,
          status: 'paid',
          method: 'card',
          provider: 'simulated',
          createdAt: now,
        },
      })

      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          booked: {
            increment: input.guests,
          },
        },
      })

      const tourist = await tx.user.findUnique({
        where: { id: touristId },
        select: { email: true },
      })

      const operator = await tx.operatorProfile.findUnique({
        where: { userId: experience.operatorId },
        select: { email: true },
      })

      if (tourist && operator) {
        await tx.emailEvent.createMany({
          data: [
            {
              id: `email-${Date.now()}-1`,
              recipient: tourist.email,
              subject: `Booking confirmed: ${experience.title}`,
              category: 'booking-confirmation',
              status: 'sent',
              createdAt: now,
            },
            {
              id: `email-${Date.now()}-2`,
              recipient: operator.email,
              subject: `New booking received for ${experience.title}`,
              category: 'operator-notice',
              status: 'sent',
              createdAt: now,
            },
          ],
        })
      }
    })

    const bookings = await listTouristBookingsFromStore(touristId)
    const created = bookings.find((booking) => booking.id === bookingId)

    if (!created) {
      throw new Error('Booking could not be loaded after creation')
    }

    return created
  }

  return updateAppData(async (data) => {
    const now = new Date().toISOString()
    const bookingId = `booking-${Date.now()}`
    const booking = {
      id: bookingId,
      experienceId: experience.id,
      touristId,
      bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`).toISOString(),
      guests: input.guests,
      totalPrice: experience.price * input.guests,
      status: 'confirmed' as BookingManagementStatus,
      notes: '',
      bookedAt: now,
      updatedAt: now,
    }

    data.bookings.push(booking)

    data.payments.push({
      id: `payment-${Date.now()}`,
      bookingId: booking.id,
      experienceId: experience.id,
      touristId,
      operatorId: experience.operatorId,
      amount: booking.totalPrice,
      currency: experience.currency,
      status: 'paid',
      method: 'card',
      provider: 'simulated',
      createdAt: now,
    })

    const storedExperience = data.experiences.find((item) => item.id === experience.id)

    if (!storedExperience) {
      throw new Error('Experience disappeared while creating booking')
    }

    const slot = storedExperience.availability.find(
      (item) => item.date.slice(0, 10) === input.bookingDate
    )

    if (!slot) {
      throw new Error('Selected date is no longer available')
    }

    slot.booked += input.guests

    const operator = data.operators.find((item) => item.id === experience.operatorId)

    if (!operator) {
      throw new Error('Operator not found')
    }

    const tourist = data.users.find((item) => item.id === touristId)

    if (tourist) {
      data.emailEvents.push(
        {
          id: `email-${Date.now()}-1`,
          recipient: tourist.email,
          subject: `Booking confirmed: ${experience.title}`,
          category: 'booking-confirmation',
          status: 'sent',
          createdAt: now,
        },
        {
          id: `email-${Date.now()}-2`,
          recipient: operator.email,
          subject: `New booking received for ${experience.title}`,
          category: 'operator-notice',
          status: 'sent',
          createdAt: now,
        }
      )
    }

    const dispute = data.disputes.find((item) => item.bookingId === booking.id)

    return {
      id: booking.id,
      experienceId: experience.id,
      experienceName: experience.title,
      operatorId: operator.id,
      operatorName: operator.name,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: 'confirmed',
      bookedAt: booking.bookedAt,
    }
  })
}

function buildDefaultAvailability() {
  const now = Date.now()
  return [
    {
      id: `avail-${now}`,
      date: new Date(now + 7 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '13:00',
      spotsAvailable: 8,
      booked: 0,
    },
    {
      id: `avail-${now + 1}`,
      date: new Date(now + 14 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '13:00',
      spotsAvailable: 8,
      booked: 0,
    },
  ]
}

function getAuthenticityByStatus(status: ExperienceStatus) {
  if (status === 'published') {
    return { score: 96, badge: 'certified' as const }
  }

  if (status === 'pending-review') {
    return { score: 82, badge: 'emerging' as const }
  }

  return { score: 70, badge: 'emerging' as const }
}

export async function createOperatorExperience(
  operatorId: string,
  input: ExperienceUpsertInput
) {
  const operator = await getOperatorProfileFromStore(operatorId)

  if (!operator) {
    throw new Error('Operator not found')
  }

  const status: ExperienceStatus = input.status ?? 'draft'

  if (hasDatabaseUrl()) {
    const now = new Date()
    const authenticity = getAuthenticityByStatus(status)
    const availability = buildDefaultAvailability()
    const experienceId = `exp-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      await tx.experience.create({
        data: {
          id: experienceId,
          title: input.title,
          category: input.category,
          description: input.description,
          shortDescription: input.shortDescription,
          image: input.image,
          images: [input.image],
          price: input.price,
          currency: input.currency,
          duration: input.duration,
          groupMin: input.groupSize.min,
          groupMax: input.groupSize.max,
          location: input.location,
          operatorId,
          rating: 0,
          reviewCount: 0,
          authenticity,
          subsections: [
            {
              id: `sub-${Date.now()}`,
              type: 'direct',
              title: 'Book Directly',
              description: `Book directly with ${operator.name}`,
              platforms: ['direct'],
              url: '#',
              image: input.image,
            },
          ],
          highlights: input.highlights,
          includes: input.includes,
          excludes: input.excludes,
          accessibility: {
            wheelchair: true,
            hearingLoop: false,
            visualAid: false,
            mobilitySupport: true,
          },
          status,
          adminNotes:
            status === 'pending-review'
              ? 'Awaiting admin review before publishing.'
              : 'Draft created by operator.',
          createdAt: now,
          updatedAt: now,
        },
      })

      await tx.availabilitySlot.createMany({
        data: availability.map((slot) => ({
          id: slot.id,
          experienceId,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          spotsAvailable: slot.spotsAvailable,
          booked: slot.booked,
        })),
      })
    })

    return experienceId
  }

  return updateAppData(async (data) => {
    const now = new Date()
    const authenticity = getAuthenticityByStatus(status)
    const availability = buildDefaultAvailability()
    const experienceId = `exp-${Date.now()}`

    data.experiences.push({
      id: experienceId,
      title: input.title,
      category: input.category,
      description: input.description,
      shortDescription: input.shortDescription,
      image: input.image,
      images: [input.image],
      price: input.price,
      currency: input.currency,
      duration: input.duration,
      groupSize: input.groupSize,
      location: input.location,
      operatorId,
      rating: 0,
      reviewCount: 0,
      authenticity,
      availability: availability.map((slot) => ({
        ...slot,
        date: slot.date.toISOString(),
      })),
      subsections: [
        {
          id: `sub-${Date.now()}`,
          type: 'direct',
          title: 'Book Directly',
          description: `Book directly with ${operator.name}`,
          platforms: ['direct'],
          url: '#',
          image: input.image,
        },
      ],
      highlights: input.highlights,
      inclusionsAndExclusions: {
        includes: input.includes,
        excludes: input.excludes,
      },
      accessibility: {
        wheelchair: true,
        hearingLoop: false,
        visualAid: false,
        mobilitySupport: true,
      },
      status,
      adminNotes:
        status === 'pending-review'
          ? 'Awaiting admin review before publishing.'
          : 'Draft created by operator.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })

    return experienceId
  })
}

export async function updateOperatorExperience(
  experienceId: string,
  operatorId: string,
  input: ExperienceUpsertInput
) {
  if (hasDatabaseUrl()) {
    const existing = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { id: true, operatorId: true, status: true, adminNotes: true },
    })

    if (!existing || existing.operatorId !== operatorId) {
      throw new Error('Experience not found')
    }

    const nextStatus =
      input.status ??
      (existing.status === 'published'
        ? 'pending-review'
        : (existing.status as ExperienceStatus))

    await prisma.experience.update({
      where: { id: experienceId },
      data: {
        title: input.title,
        category: input.category,
        description: input.description,
        shortDescription: input.shortDescription,
        image: input.image,
        images: [input.image],
        price: input.price,
        currency: input.currency,
        duration: input.duration,
        groupMin: input.groupSize.min,
        groupMax: input.groupSize.max,
        location: input.location,
        highlights: input.highlights,
        includes: input.includes,
        excludes: input.excludes,
        status: nextStatus,
        authenticity: getAuthenticityByStatus(nextStatus),
        adminNotes:
          nextStatus === 'pending-review'
            ? 'Updated by operator and awaiting admin review.'
            : existing.adminNotes,
        updatedAt: new Date(),
      },
    })

    return experienceId
  }

  return updateAppData(async (data) => {
    const experience = data.experiences.find((item) => item.id === experienceId)

    if (!experience || experience.operatorId !== operatorId) {
      throw new Error('Experience not found')
    }

    const nextStatus =
      input.status ??
      (experience.status === 'published' ? 'pending-review' : experience.status)

    experience.title = input.title
    experience.category = input.category
    experience.description = input.description
    experience.shortDescription = input.shortDescription
    experience.image = input.image
    experience.images = [input.image]
    experience.price = input.price
    experience.currency = input.currency
    experience.duration = input.duration
    experience.groupSize = input.groupSize
    experience.location = input.location
    experience.highlights = input.highlights
    experience.inclusionsAndExclusions = {
      includes: input.includes,
      excludes: input.excludes,
    }
    experience.status = nextStatus
    experience.authenticity = getAuthenticityByStatus(nextStatus)
    experience.adminNotes =
      nextStatus === 'pending-review'
        ? 'Updated by operator and awaiting admin review.'
        : experience.adminNotes
    experience.updatedAt = new Date().toISOString()

    return experienceId
  })
}

export async function deleteOperatorExperience(experienceId: string, operatorId: string) {
  if (hasDatabaseUrl()) {
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { id: true, operatorId: true },
    })

    if (!experience || experience.operatorId !== operatorId) {
      throw new Error('Experience not found')
    }

    const activeBookings = await prisma.booking.count({
      where: {
        experienceId,
        status: {
          notIn: ['cancelled', 'completed'],
        },
      },
    })

    if (activeBookings > 0) {
      throw new Error('You cannot delete an experience with active bookings')
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    })

    return { deleted: true }
  }

  return updateAppData(async (data) => {
    const index = data.experiences.findIndex(
      (item) => item.id === experienceId && item.operatorId === operatorId
    )

    if (index === -1) {
      throw new Error('Experience not found')
    }

    const experience = data.experiences[index]
    const activeBookings = data.bookings.some(
      (booking) =>
        booking.experienceId === experience.id &&
        booking.status !== 'cancelled' &&
        booking.status !== 'completed'
    )

    if (activeBookings) {
      throw new Error('You cannot delete an experience with active bookings')
    }

    data.experiences.splice(index, 1)
    return { deleted: true }
  })
}

export async function cancelTouristBooking(
  bookingId: string,
  touristId = getDefaultViewerIds().touristId
): Promise<TouristBookingRecord> {
  if (hasDatabaseUrl()) {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.touristId !== touristId) {
        throw new Error('You do not have access to that booking')
      }

      const wasCancelled = booking.status === 'cancelled'
      const updatedAt = new Date()

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'cancelled',
          updatedAt,
        },
      })

      const experience = await tx.experience.findUnique({
        where: { id: booking.experienceId },
      })

      if (!experience) {
        throw new Error('Experience not found')
      }

      const operator = await tx.operatorProfile.findUnique({
        where: { userId: experience.operatorId },
      })

      if (!operator) {
        throw new Error('Operator not found')
      }

      const slot = await tx.availabilitySlot.findFirst({
        where: {
          experienceId: booking.experienceId,
          date: {
            gte: new Date(booking.bookingDate.toISOString().slice(0, 10) + 'T00:00:00.000Z'),
            lt: new Date(booking.bookingDate.toISOString().slice(0, 10) + 'T23:59:59.999Z'),
          },
        },
      })

      if (slot && !wasCancelled) {
        await tx.availabilitySlot.update({
          where: { id: slot.id },
          data: {
            booked: Math.max(0, slot.booked - booking.guests),
          },
        })
      }

      const payment = await tx.payment.findFirst({
        where: {
          bookingId: booking.id,
          status: 'paid',
        },
      })

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'refunded',
            refundedAt: updatedAt,
          },
        })
      }

      const tourist = await tx.user.findUnique({
        where: { id: booking.touristId },
        select: { email: true },
      })

      if (tourist) {
        await tx.emailEvent.createMany({
          data: [
            {
              id: `email-${Date.now()}-cancel-tourist`,
              recipient: tourist.email,
              subject: `Booking cancelled: ${experience.title}`,
              category: 'booking-cancellation',
              status: 'sent',
              createdAt: updatedAt,
            },
            {
              id: `email-${Date.now()}-cancel-operator`,
              recipient: operator.email,
              subject: `Booking cancelled for ${experience.title}`,
              category: 'operator-notice',
              status: 'sent',
              createdAt: updatedAt,
            },
          ],
        })
      }
    })

    const bookings = await listTouristBookingsFromStore(touristId)
    const updated = bookings.find((booking) => booking.id === bookingId)

    if (!updated) {
      throw new Error('Booking could not be loaded after cancellation')
    }

    return updated
  }

  return updateAppData(async (data) => {
    const booking = data.bookings.find((item) => item.id === bookingId)

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.touristId !== touristId) {
      throw new Error('You do not have access to that booking')
    }

    const wasCancelled = booking.status === 'cancelled'
    booking.status = 'cancelled'
    booking.updatedAt = new Date().toISOString()

    const experience = data.experiences.find((item) => item.id === booking.experienceId)

    if (!experience) {
      throw new Error('Experience not found')
    }

    const slot = experience.availability.find(
      (item) => item.date.slice(0, 10) === booking.bookingDate.slice(0, 10)
    )

    if (slot && !wasCancelled) {
      slot.booked = Math.max(0, slot.booked - booking.guests)
    }

    const operator = data.operators.find((item) => item.id === experience.operatorId)

    if (!operator) {
      throw new Error('Operator not found')
    }

    const payment = data.payments.find(
      (item) => item.bookingId === booking.id && item.status === 'paid'
    )

    if (payment) {
      payment.status = 'refunded'
      payment.refundedAt = booking.updatedAt
    }

    const tourist = data.users.find((item) => item.id === booking.touristId)

    if (tourist) {
      data.emailEvents.push(
        {
          id: `email-${Date.now()}-cancel-tourist`,
          recipient: tourist.email,
          subject: `Booking cancelled: ${experience.title}`,
          category: 'booking-cancellation',
          status: 'sent',
          createdAt: booking.updatedAt,
        },
        {
          id: `email-${Date.now()}-cancel-operator`,
          recipient: operator.email,
          subject: `Booking cancelled for ${experience.title}`,
          category: 'operator-notice',
          status: 'sent',
          createdAt: booking.updatedAt,
        }
      )
    }

    const dispute = data.disputes.find((item) => item.bookingId === booking.id)

    return {
      id: booking.id,
      experienceId: experience.id,
      experienceName: experience.title,
      operatorId: operator.id,
      operatorName: operator.name,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: 'cancelled',
      bookedAt: booking.bookedAt,
      dispute: dispute
        ? {
            id: dispute.id,
            status: dispute.status,
          }
        : null,
    }
  })
}

export async function updateOperatorBooking(
  bookingId: string,
  updates: {
    status?: OperatorBookingRecord['status']
    notes?: string
  },
  operatorId = getDefaultViewerIds().operatorId
): Promise<OperatorBookingRecord> {
  if (hasDatabaseUrl()) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true,
      },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.experience.operatorId !== operatorId) {
      throw new Error('You do not have access to that booking')
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: updates.status ?? undefined,
        notes: typeof updates.notes === 'string' ? updates.notes : undefined,
        updatedAt: new Date(),
      },
    })

    const bookings = await listOperatorBookingsFromStore(operatorId)
    const updated = bookings.find((item) => item.id === bookingId)

    if (!updated) {
      throw new Error('Booking could not be loaded after update')
    }

    return updated
  }

  return updateAppData(async (data) => {
    const booking = data.bookings.find((item) => item.id === bookingId)

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (updates.status) {
      booking.status = updates.status
    }

    if (typeof updates.notes === 'string') {
      booking.notes = updates.notes
    }

    booking.updatedAt = new Date().toISOString()

    const experience = data.experiences.find((item) => item.id === booking.experienceId)

    if (!experience) {
      throw new Error('Experience not found')
    }

    if (experience.operatorId !== operatorId) {
      throw new Error('You do not have access to that booking')
    }

    const tourist = data.users.find((item) => item.id === booking.touristId)

    if (!tourist) {
      throw new Error('Tourist not found')
    }

    return {
      id: booking.id,
      experienceId: experience.id,
      experienceName: experience.title,
      guestName: tourist.name,
      guestEmail: tourist.email,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      notes: booking.notes,
      bookedAt: booking.bookedAt,
    }
  })
}

export async function getOperatorDashboard(operatorId: string) {
  const [operator, experiences, bookings] = await Promise.all([
    getOperatorProfileFromStore(operatorId),
    listExperiencesByOperator(operatorId),
    listOperatorBookings(operatorId),
  ])

  if (!operator) {
    throw new Error('Operator not found')
  }

  const totalBookings = bookings.filter((booking) => booking.status !== 'cancelled').length
  const totalGuests = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + booking.guests, 0)

  const upcomingExperiences = experiences.reduce((count, experience) => {
    const hasUpcomingAvailability = experience.availability.some(
      (slot) => new Date(slot.date).getTime() > Date.now()
    )

    return count + (hasUpcomingAvailability ? 1 : 0)
  }, 0)

  const recentBookings = bookings
    .slice()
    .sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime())
    .reverse()
    .slice(0, 4)

  return {
    operator,
    experiences,
    recentBookings,
    stats: {
      totalBookings,
      upcomingExperiences,
      totalGuests,
      rating: operator.rating,
      reviewCount: operator.reviewCount,
    },
  }
}

export async function getAdminModerationData() {
  const [operators, experiences, payments, emailEvents, bookings, disputes] = await Promise.all([
    listOperatorProfilesFromStore(),
    listExperiencesFromStore(),
    listPaymentsFromStore(),
    listEmailEventsFromStore(),
    listOperatorBookingsFromStore(),
    listAdminDisputes(),
  ])

  return {
    operators,
    experiences,
    operations: {
      grossRevenue: payments
        .filter((payment) => payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0),
      refundsIssued: payments
        .filter((payment) => payment.status === 'refunded')
        .reduce((sum, payment) => sum + payment.amount, 0),
      activeBookings: bookings.filter((booking) => booking.status !== 'cancelled').length,
      emailsSent: emailEvents.filter((event) => event.status === 'sent').length,
      openDisputes: disputes.filter((dispute) => dispute.status === 'open').length,
    },
    emailEvents: emailEvents
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    disputes: disputes.slice(0, 8),
  }
}

export async function updateOperatorVerification(
  operatorId: string,
  verificationStatus: 'verified' | 'pending' | 'unverified'
) {
  if (hasDatabaseUrl()) {
    const operator = await prisma.operatorProfile.findUnique({
      where: { userId: operatorId },
      select: { userId: true },
    })

    if (!operator) {
      throw new Error('Operator not found')
    }

    await prisma.operatorProfile.update({
      where: { userId: operatorId },
      data: { verificationStatus },
    })

    return getOperatorProfileFromStore(operatorId)
  }

  return updateAppData(async (data) => {
    const operator = data.operators.find((item) => item.id === operatorId)

    if (!operator) {
      throw new Error('Operator not found')
    }

    operator.verificationStatus = verificationStatus
    return operator
  })
}

export async function updateExperienceModeration(
  experienceId: string,
  updates: {
    status: ExperienceStatus
    adminNotes?: string
  }
) {
  if (hasDatabaseUrl()) {
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { id: true, operatorId: true, adminNotes: true },
    })

    if (!experience) {
      throw new Error('Experience not found')
    }

    if (updates.status === 'published') {
      const operator = await prisma.operatorProfile.findUnique({
        where: { userId: experience.operatorId },
        select: { verificationStatus: true },
      })

      if (!operator || operator.verificationStatus !== 'verified') {
        throw new Error('Only experiences from verified operators can be published')
      }
    }

    await prisma.experience.update({
      where: { id: experienceId },
      data: {
        status: updates.status,
        authenticity: getAuthenticityByStatus(updates.status),
        adminNotes: updates.adminNotes ?? experience.adminNotes,
        updatedAt: new Date(),
      },
    })

    return experienceId
  }

  return updateAppData(async (data) => {
    const experience = data.experiences.find((item) => item.id === experienceId)

    if (!experience) {
      throw new Error('Experience not found')
    }

    if (updates.status === 'published') {
      const operator = data.operators.find((item) => item.id === experience.operatorId)

      if (!operator || operator.verificationStatus !== 'verified') {
        throw new Error('Only experiences from verified operators can be published')
      }
    }

    experience.status = updates.status
    experience.authenticity = getAuthenticityByStatus(updates.status)
    experience.adminNotes = updates.adminNotes ?? experience.adminNotes
    experience.updatedAt = new Date().toISOString()

    return experienceId
  })
}

export async function createBookingDispute(bookingId: string, touristId: string, reason: string) {
  if (hasDatabaseUrl()) {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.touristId !== touristId) {
        throw new Error('You do not have access to that booking')
      }

      const existing = await tx.dispute.findUnique({
        where: { bookingId },
      })

      if (existing && existing.status === 'open') {
        throw new Error('An open dispute already exists for this booking')
      }

      const experience = await tx.experience.findUnique({
        where: { id: booking.experienceId },
      })
      const operator = experience
        ? await tx.operatorProfile.findUnique({
            where: { userId: experience.operatorId },
          })
        : null
      const tourist = await tx.user.findUnique({
        where: { id: touristId },
      })

      if (!experience || !operator || !tourist) {
        throw new Error('Unable to create dispute for this booking')
      }

      const now = new Date()

      if (existing) {
        await tx.dispute.update({
          where: { bookingId },
          data: {
            reason,
            status: 'open',
            createdAt: now,
            resolutionNotes: null,
            resolvedAt: null,
          },
        })
      } else {
        await tx.dispute.create({
          data: {
            id: `dispute-${Date.now()}`,
            bookingId: booking.id,
            touristId,
            operatorId: operator.userId,
            reason,
            status: 'open',
            createdAt: now,
          },
        })
      }

      await tx.emailEvent.createMany({
        data: [
          {
            id: `email-${Date.now()}-dispute-admin`,
            recipient: 'admin@africonnect.com',
            subject: `New dispute reported for ${experience.title}`,
            category: 'dispute-update',
            status: 'sent',
            createdAt: now,
          },
          {
            id: `email-${Date.now()}-dispute-tourist`,
            recipient: tourist.email,
            subject: `Support request received for ${experience.title}`,
            category: 'dispute-update',
            status: 'sent',
            createdAt: now,
          },
        ],
      })
    })

    const bookings = await listTouristBookingsFromStore(touristId)
    const updated = bookings.find((booking) => booking.id === bookingId)

    if (!updated) {
      throw new Error('Booking could not be loaded after dispute creation')
    }

    return updated
  }

  return updateAppData(async (data) => {
    const booking = data.bookings.find((item) => item.id === bookingId)

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.touristId !== touristId) {
      throw new Error('You do not have access to that booking')
    }

    const existing = data.disputes.find((item) => item.bookingId === bookingId)

    if (existing && existing.status === 'open') {
      throw new Error('An open dispute already exists for this booking')
    }

    const experience = data.experiences.find((item) => item.id === booking.experienceId)
    const operator = experience
      ? data.operators.find((item) => item.id === experience.operatorId)
      : null
    const tourist = data.users.find((item) => item.id === touristId)

    if (!experience || !operator || !tourist) {
      throw new Error('Unable to create dispute for this booking')
    }

    const now = new Date().toISOString()

    if (existing) {
      existing.reason = reason
      existing.status = 'open'
      existing.createdAt = now
      existing.resolutionNotes = undefined
      existing.resolvedAt = undefined
    } else {
      data.disputes.push({
        id: `dispute-${Date.now()}`,
        bookingId: booking.id,
        touristId,
        operatorId: operator.id,
        reason,
        status: 'open',
        createdAt: now,
      })
    }

    data.emailEvents.push(
      {
        id: `email-${Date.now()}-dispute-admin`,
        recipient: 'admin@africonnect.com',
        subject: `New dispute reported for ${experience.title}`,
        category: 'dispute-update',
        status: 'sent',
        createdAt: now,
      },
      {
        id: `email-${Date.now()}-dispute-tourist`,
        recipient: tourist.email,
        subject: `Support request received for ${experience.title}`,
        category: 'dispute-update',
        status: 'sent',
        createdAt: now,
      }
    )

    const dispute = data.disputes.find((item) => item.bookingId === booking.id)

    return {
      id: booking.id,
      experienceId: booking.experienceId,
      experienceName: experience.title,
      operatorId: operator.id,
      operatorName: operator.name,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status:
        booking.status === 'in-progress'
          ? 'confirmed'
          : booking.status === 'completed'
            ? 'completed'
            : booking.status,
      bookedAt: booking.bookedAt,
      dispute: dispute
        ? {
            id: dispute.id,
            status: dispute.status,
          }
        : null,
    } satisfies TouristBookingRecord
  })
}

export async function resolveDispute(
  disputeId: string,
  resolutionNotes?: string
) {
  if (hasDatabaseUrl()) {
    await prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id: disputeId },
      })

      if (!dispute) {
        throw new Error('Dispute not found')
      }

      const resolvedAt = new Date()

      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: 'resolved',
          resolutionNotes: resolutionNotes?.trim() || 'Resolved by admin.',
          resolvedAt,
        },
      })

      const tourist = await tx.user.findUnique({
        where: { id: dispute.touristId },
        select: { email: true },
      })
      const operator = await tx.operatorProfile.findUnique({
        where: { userId: dispute.operatorId },
        select: { email: true },
      })

      const events = []

      if (tourist) {
        events.push({
          id: `email-${Date.now()}-dispute-resolved-tourist`,
          recipient: tourist.email,
          subject: `Your support request has been resolved`,
          category: 'dispute-update',
          status: 'sent',
          createdAt: resolvedAt,
        })
      }

      if (operator) {
        events.push({
          id: `email-${Date.now()}-dispute-resolved-operator`,
          recipient: operator.email,
          subject: `A support case for one of your bookings was resolved`,
          category: 'dispute-update',
          status: 'sent',
          createdAt: resolvedAt,
        })
      }

      if (events.length > 0) {
        await tx.emailEvent.createMany({
          data: events,
        })
      }
    })

    return disputeId
  }

  return updateAppData(async (data) => {
    const dispute = data.disputes.find((item) => item.id === disputeId)

    if (!dispute) {
      throw new Error('Dispute not found')
    }

    dispute.status = 'resolved'
    dispute.resolutionNotes = resolutionNotes?.trim() || 'Resolved by admin.'
    dispute.resolvedAt = new Date().toISOString()

    const tourist = data.users.find((item) => item.id === dispute.touristId)
    const operator = data.operators.find((item) => item.id === dispute.operatorId)

    if (tourist) {
      data.emailEvents.push({
        id: `email-${Date.now()}-dispute-resolved-tourist`,
        recipient: tourist.email,
        subject: `Your support request has been resolved`,
        category: 'dispute-update',
        status: 'sent',
        createdAt: dispute.resolvedAt,
      })
    }

    if (operator) {
      data.emailEvents.push({
        id: `email-${Date.now()}-dispute-resolved-operator`,
        recipient: operator.email,
        subject: `A support case for one of your bookings was resolved`,
        category: 'dispute-update',
        status: 'sent',
        createdAt: dispute.resolvedAt,
      })
    }

    return disputeId
  })
}
