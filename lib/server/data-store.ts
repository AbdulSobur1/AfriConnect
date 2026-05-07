import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Prisma } from '@prisma/client'
import {
  Experience,
  ExperienceOperator,
  TouristBookingRecord,
  OperatorBookingRecord,
  BookingManagementStatus,
  BookingStatus,
  UserRole,
  OnboardingQuizResponse,
  PaymentRecord,
  EmailEventRecord,
  DisputeRecord,
  AccountSettings,
} from '@/lib/types'
import { mockCurrentUser, mockExperiences, mockOperators } from '@/lib/mock-data'
import { hasDatabaseUrl, prisma } from '@/lib/server/db'
import { hashPassword } from '@/lib/server/password'

interface StoredUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
  savedExperienceIds?: string[]
  onboardingPreferences?: OnboardingQuizResponse | null
  accountSettings?: AccountSettings
  passwordHash?: string
}

interface StoredOperator extends Omit<ExperienceOperator, 'joinDate' | 'experiences'> {
  joinDate: string
}

interface StoredExperience
  extends Omit<Experience, 'operator' | 'createdAt' | 'updatedAt' | 'availability'> {
  createdAt: string
  updatedAt: string
  availability: Array<
    Omit<Experience['availability'][number], 'date'> & {
      date: string
    }
  >
}

interface StoredBooking {
  id: string
  experienceId: string
  touristId: string
  bookingDate: string
  guests: number
  totalPrice: number
  status: BookingManagementStatus
  notes: string
  bookedAt: string
  updatedAt: string
}

interface StoredPayment extends PaymentRecord {}

interface StoredEmailEvent extends EmailEventRecord {}

interface StoredDispute extends DisputeRecord {}

interface AppData {
  users: StoredUser[]
  operators: StoredOperator[]
  experiences: StoredExperience[]
  bookings: StoredBooking[]
  payments: StoredPayment[]
  emailEvents: StoredEmailEvent[]
  disputes: StoredDispute[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'app-data.json')
const APP_STATE_ID = 'main'
const RELATIONAL_BOOTSTRAP_LOCK_ID = 'relational-bootstrap-lock'

const DEFAULT_OPERATOR_ID = mockOperators[0].id
const DEFAULT_TOURIST_ID = mockCurrentUser.id

let writeQueue: Promise<unknown> = Promise.resolve()

function getDefaultAccountSettings(): AccountSettings {
  return {
    marketingEmails: true,
    bookingReminders: true,
    smsAlerts: false,
    language: 'en',
    currency: 'USD',
    profileVisibility: 'public',
  }
}

function getSeedAdminPasswordHash() {
  const password = process.env.ADMIN_SEED_PASSWORD?.trim()
  return password ? hashPassword(password) : undefined
}

async function ensureSeedAdminPassword() {
  const passwordHash = getSeedAdminPasswordHash()

  if (!passwordHash || !hasDatabaseUrl()) {
    return
  }

  await prisma.user.updateMany({
    where: {
      email: 'admin@africonnect.com',
      OR: [{ passwordHash: null }, { passwordHash: '' }],
    },
    data: {
      passwordHash,
    },
  })
}

function makeSeedExperience(experience: Experience): Experience {
  return {
    ...experience,
    status: 'published',
    adminNotes: 'Seeded approved experience',
  }
}

function serializeExperience(experience: Experience): StoredExperience {
  const { operator: _operator, ...rest } = experience

  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    updatedAt: rest.updatedAt.toISOString(),
    availability: rest.availability.map((slot) => ({
      ...slot,
      date: slot.date.toISOString(),
    })),
  }
}

function serializeOperator(operator: ExperienceOperator): StoredOperator {
  const { experiences: _experiences, ...rest } = operator

  return {
    ...rest,
    joinDate: rest.joinDate.toISOString(),
  }
}

function hydrateExperience(
  experience: StoredExperience,
  operatorsById: Map<string, StoredOperator>
): Experience {
  const operator = operatorsById.get(experience.operatorId)

  if (!operator) {
    throw new Error(`Missing operator ${experience.operatorId} for experience ${experience.id}`)
  }

  return {
    ...experience,
    operator: {
      ...operator,
      joinDate: new Date(operator.joinDate),
      experiences: [],
    },
    availability: experience.availability.map((slot) => ({
      ...slot,
      date: new Date(slot.date),
    })),
    createdAt: new Date(experience.createdAt),
    updatedAt: new Date(experience.updatedAt),
  }
}

function createSeedData(): AppData {
  const users: StoredUser[] = [
    {
      id: mockCurrentUser.id,
      name: mockCurrentUser.name,
      email: mockCurrentUser.email,
      role: 'tourist',
      avatar: mockCurrentUser.avatar,
      createdAt: mockCurrentUser.createdAt.toISOString(),
      savedExperienceIds: [],
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash: undefined,
    },
    ...mockOperators.map((operator) => ({
      id: operator.id,
      name: operator.name,
      email: operator.email,
      role: 'operator' as const,
      avatar: operator.avatar,
      createdAt: operator.joinDate.toISOString(),
      savedExperienceIds: [],
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash: undefined,
    })),
    {
      id: 'admin-1',
      name: 'AfriConnect Admin',
      email: 'admin@africonnect.com',
      role: 'admin',
      avatar: undefined,
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      savedExperienceIds: [],
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash: getSeedAdminPasswordHash(),
    },
  ]

  const bookings: StoredBooking[] = [
    {
      id: 'booking-seed-1',
      experienceId: mockExperiences[4].id,
      touristId: DEFAULT_TOURIST_ID,
      bookingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      guests: 2,
      totalPrice: mockExperiences[4].price * 2,
      status: 'confirmed',
      notes: 'Guest prefers a morning start.',
      bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'booking-seed-2',
      experienceId: mockExperiences[0].id,
      touristId: DEFAULT_TOURIST_ID,
      bookingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      guests: 1,
      totalPrice: mockExperiences[0].price,
      status: 'pending',
      notes: '',
      bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return {
    users,
    operators: mockOperators.map(serializeOperator),
    experiences: mockExperiences.map((experience) =>
      serializeExperience(makeSeedExperience(experience))
    ),
    bookings,
    payments: [],
    emailEvents: [],
    disputes: [],
  }
}

function toPrismaJson(data: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue
}

function fromPrismaJson<T>(value: Prisma.JsonValue | null | undefined): T | null {
  if (value === null || value === undefined) {
    return null
  }

  return value as unknown as T
}

function isPrismaKnownError(error: unknown, code: string) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === code
  )
}

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await readFile(DATA_FILE, 'utf8')
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(createSeedData(), null, 2), 'utf8')
  }
}

function normalizeData(data: AppData) {
  let changed = false

  for (const user of data.users) {
    if (!Array.isArray(user.savedExperienceIds)) {
      user.savedExperienceIds = []
      changed = true
    }

    if (!('onboardingPreferences' in user)) {
      user.onboardingPreferences = null
      changed = true
    }

    if (!user.accountSettings) {
      user.accountSettings = getDefaultAccountSettings()
      changed = true
    }
  }

  for (const experience of data.experiences) {
    if (!experience.status) {
      experience.status = 'published'
      changed = true
    }

    if (!('adminNotes' in experience)) {
      experience.adminNotes =
        experience.status === 'published'
          ? 'Approved migrated experience.'
          : 'Migrated experience record.'
      changed = true
    }
  }

  if (!Array.isArray(data.payments)) {
    data.payments = []
    changed = true
  }

  for (const payment of data.payments as Array<StoredPayment & { experienceId?: string }>) {
    if (!payment.experienceId) {
      const booking = data.bookings.find((item) => item.id === payment.bookingId)
      payment.experienceId = booking?.experienceId ?? ''
      changed = true
    }
  }

  if (!Array.isArray(data.emailEvents)) {
    data.emailEvents = []
    changed = true
  }

  if (!Array.isArray(data.disputes)) {
    data.disputes = []
    changed = true
  }

  return { data, changed }
}

async function readLegacyAppStateFromDatabase() {
  const record = await prisma.appState.findUnique({
    where: { id: APP_STATE_ID },
  })

  if (!record) {
    return null
  }

  const parsed = fromPrismaJson<AppData>(record.payload)
  return parsed ? normalizeData(parsed).data : null
}

async function readRelationalAppData(): Promise<AppData> {
  const [
    users,
    operatorProfiles,
    experiences,
    availabilitySlots,
    bookings,
    payments,
    emailEvents,
    disputes,
    savedExperiences,
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.operatorProfile.findMany({ orderBy: { joinDate: 'asc' } }),
    prisma.experience.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.availabilitySlot.findMany({ orderBy: { date: 'asc' } }),
    prisma.booking.findMany({ orderBy: { bookedAt: 'asc' } }),
    prisma.payment.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.emailEvent.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.dispute.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.savedExperience.findMany(),
  ])

  const savedIdsByUser = new Map<string, string[]>()

  for (const saved of savedExperiences) {
    const list = savedIdsByUser.get(saved.touristId) ?? []
    list.push(saved.experienceId)
    savedIdsByUser.set(saved.touristId, list)
  }

  const storedUsers: StoredUser[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    avatar: user.avatar ?? undefined,
    createdAt: user.createdAt.toISOString(),
    savedExperienceIds: savedIdsByUser.get(user.id) ?? [],
    onboardingPreferences:
      fromPrismaJson<OnboardingQuizResponse>(user.onboardingPreferences) ?? null,
    accountSettings:
      fromPrismaJson<AccountSettings>(user.accountSettings) ?? getDefaultAccountSettings(),
    passwordHash: user.passwordHash ?? undefined,
  }))

  const storedOperators: StoredOperator[] = operatorProfiles.map((operator) => ({
    id: operator.userId,
    name: operator.name,
    email: operator.email,
    phone: operator.phone,
    bio: operator.bio,
    avatar: operator.avatar,
    rating: operator.rating,
    reviewCount: operator.reviewCount,
    joinDate: operator.joinDate.toISOString(),
    verificationStatus: operator.verificationStatus as StoredOperator['verificationStatus'],
  }))

  const availabilityByExperienceId = new Map<
    string,
    StoredExperience['availability']
  >()

  for (const slot of availabilitySlots) {
    const list = availabilityByExperienceId.get(slot.experienceId) ?? []
    list.push({
      id: slot.id,
      date: slot.date.toISOString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      spotsAvailable: slot.spotsAvailable,
      booked: slot.booked,
    })
    availabilityByExperienceId.set(slot.experienceId, list)
  }

  const storedExperiences: StoredExperience[] = experiences.map((experience) => ({
    id: experience.id,
    title: experience.title,
    category: experience.category as StoredExperience['category'],
    description: experience.description,
    shortDescription: experience.shortDescription,
    image: experience.image,
    images: fromPrismaJson<string[]>(experience.images) ?? [],
    price: experience.price,
    currency: experience.currency,
    duration: experience.duration,
    groupSize: {
      min: experience.groupMin,
      max: experience.groupMax,
    },
    location:
      fromPrismaJson<Experience['location']>(experience.location) ?? {
        city: '',
        region: '',
        coordinates: [0, 0],
      },
    operatorId: experience.operatorId,
    rating: experience.rating,
    reviewCount: experience.reviewCount,
    authenticity:
      fromPrismaJson<Experience['authenticity']>(experience.authenticity) ?? {
        score: 0,
        badge: 'emerging',
      },
    availability: availabilityByExperienceId.get(experience.id) ?? [],
    subsections: fromPrismaJson<Experience['subsections']>(experience.subsections) ?? [],
    highlights: fromPrismaJson<string[]>(experience.highlights) ?? [],
    inclusionsAndExclusions: {
      includes: fromPrismaJson<string[]>(experience.includes) ?? [],
      excludes: fromPrismaJson<string[]>(experience.excludes) ?? [],
    },
    accessibility:
      fromPrismaJson<Experience['accessibility']>(experience.accessibility) ?? {
        wheelchair: false,
        hearingLoop: false,
        visualAid: false,
        mobilitySupport: false,
      },
    status: experience.status as StoredExperience['status'],
    adminNotes: experience.adminNotes ?? undefined,
    createdAt: experience.createdAt.toISOString(),
    updatedAt: experience.updatedAt.toISOString(),
  }))

  const storedBookings: StoredBooking[] = bookings.map((booking) => ({
    id: booking.id,
    experienceId: booking.experienceId,
    touristId: booking.touristId,
    bookingDate: booking.bookingDate.toISOString(),
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    status: booking.status as StoredBooking['status'],
    notes: booking.notes,
    bookedAt: booking.bookedAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }))

  const storedPayments: StoredPayment[] = payments.map((payment) => ({
    id: payment.id,
    bookingId: payment.bookingId,
    experienceId: payment.experienceId,
    touristId: payment.touristId,
    operatorId: payment.operatorId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status as StoredPayment['status'],
    method: payment.method as StoredPayment['method'],
    provider: payment.provider as StoredPayment['provider'],
    createdAt: payment.createdAt.toISOString(),
    refundedAt: payment.refundedAt?.toISOString(),
  }))

  const storedEmailEvents: StoredEmailEvent[] = emailEvents.map((event) => ({
    id: event.id,
    recipient: event.recipient,
    subject: event.subject,
    category: event.category as StoredEmailEvent['category'],
    status: event.status as StoredEmailEvent['status'],
    createdAt: event.createdAt.toISOString(),
  }))

  const storedDisputes: StoredDispute[] = disputes.map((dispute) => ({
    id: dispute.id,
    bookingId: dispute.bookingId,
    touristId: dispute.touristId,
    operatorId: dispute.operatorId,
    reason: dispute.reason,
    status: dispute.status as StoredDispute['status'],
    createdAt: dispute.createdAt.toISOString(),
    resolutionNotes: dispute.resolutionNotes ?? undefined,
    resolvedAt: dispute.resolvedAt?.toISOString(),
  }))

  return normalizeData({
    users: storedUsers,
    operators: storedOperators,
    experiences: storedExperiences,
    bookings: storedBookings,
    payments: storedPayments,
    emailEvents: storedEmailEvents,
    disputes: storedDisputes,
  }).data
}

async function persistRelationalAppData(data: AppData) {
  const normalized = normalizeData(data).data

  await prisma.$transaction(async (tx) => {
    await tx.savedExperience.deleteMany()
    await tx.dispute.deleteMany()
    await tx.payment.deleteMany()
    await tx.booking.deleteMany()
    await tx.availabilitySlot.deleteMany()
    await tx.emailEvent.deleteMany()
    await tx.experience.deleteMany()
    await tx.operatorProfile.deleteMany()
    await tx.user.deleteMany()

    if (normalized.users.length > 0) {
      await tx.user.createMany({
        data: normalized.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar ?? null,
          createdAt: new Date(user.createdAt),
          onboardingPreferences: toPrismaJson(user.onboardingPreferences ?? null),
          accountSettings: toPrismaJson(user.accountSettings ?? getDefaultAccountSettings()),
          passwordHash: user.passwordHash ?? null,
        })),
      })
    }

    if (normalized.operators.length > 0) {
      await tx.operatorProfile.createMany({
        data: normalized.operators.map((operator) => ({
          userId: operator.id,
          name: operator.name,
          email: operator.email,
          phone: operator.phone,
          bio: operator.bio,
          avatar: operator.avatar,
          rating: operator.rating,
          reviewCount: operator.reviewCount,
          joinDate: new Date(operator.joinDate),
          verificationStatus: operator.verificationStatus,
        })),
      })
    }

    if (normalized.experiences.length > 0) {
      await tx.experience.createMany({
        data: normalized.experiences.map((experience) => ({
          id: experience.id,
          title: experience.title,
          category: experience.category,
          description: experience.description,
          shortDescription: experience.shortDescription,
          image: experience.image,
          images: toPrismaJson(experience.images),
          price: experience.price,
          currency: experience.currency,
          duration: experience.duration,
          groupMin: experience.groupSize.min,
          groupMax: experience.groupSize.max,
          location: toPrismaJson(experience.location),
          operatorId: experience.operatorId,
          rating: experience.rating,
          reviewCount: experience.reviewCount,
          authenticity: toPrismaJson(experience.authenticity),
          subsections: toPrismaJson(experience.subsections),
          highlights: toPrismaJson(experience.highlights),
          includes: toPrismaJson(experience.inclusionsAndExclusions.includes),
          excludes: toPrismaJson(experience.inclusionsAndExclusions.excludes),
          accessibility: toPrismaJson(experience.accessibility),
          status: experience.status,
          adminNotes: experience.adminNotes ?? null,
          createdAt: new Date(experience.createdAt),
          updatedAt: new Date(experience.updatedAt),
        })),
      })

      const availabilityData = normalized.experiences.flatMap((experience) =>
        experience.availability.map((slot) => ({
          id: slot.id,
          experienceId: experience.id,
          date: new Date(slot.date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          spotsAvailable: slot.spotsAvailable,
          booked: slot.booked,
        }))
      )

      if (availabilityData.length > 0) {
        await tx.availabilitySlot.createMany({
          data: availabilityData,
        })
      }
    }

    if (normalized.bookings.length > 0) {
      await tx.booking.createMany({
        data: normalized.bookings.map((booking) => ({
          id: booking.id,
          experienceId: booking.experienceId,
          touristId: booking.touristId,
          bookingDate: new Date(booking.bookingDate),
          guests: booking.guests,
          totalPrice: booking.totalPrice,
          status: booking.status,
          notes: booking.notes,
          bookedAt: new Date(booking.bookedAt),
          updatedAt: new Date(booking.updatedAt),
        })),
      })
    }

    if (normalized.payments.length > 0) {
      await tx.payment.createMany({
        data: normalized.payments.map((payment) => ({
          id: payment.id,
          bookingId: payment.bookingId,
          experienceId: payment.experienceId,
          touristId: payment.touristId,
          operatorId: payment.operatorId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          provider: payment.provider,
          createdAt: new Date(payment.createdAt),
          refundedAt: payment.refundedAt ? new Date(payment.refundedAt) : null,
        })),
      })
    }

    if (normalized.emailEvents.length > 0) {
      await tx.emailEvent.createMany({
        data: normalized.emailEvents.map((event) => ({
          id: event.id,
          recipient: event.recipient,
          subject: event.subject,
          category: event.category,
          status: event.status,
          createdAt: new Date(event.createdAt),
        })),
      })
    }

    if (normalized.disputes.length > 0) {
      await tx.dispute.createMany({
        data: normalized.disputes.map((dispute) => ({
          id: dispute.id,
          bookingId: dispute.bookingId,
          touristId: dispute.touristId,
          operatorId: dispute.operatorId,
          reason: dispute.reason,
          status: dispute.status,
          createdAt: new Date(dispute.createdAt),
          resolutionNotes: dispute.resolutionNotes ?? null,
          resolvedAt: dispute.resolvedAt ? new Date(dispute.resolvedAt) : null,
        })),
      })
    }

    const savedData = normalized.users.flatMap((user) =>
      (user.savedExperienceIds ?? []).map((experienceId) => ({
        touristId: user.id,
        experienceId,
      }))
    )

    if (savedData.length > 0) {
      await tx.savedExperience.createMany({
        data: savedData,
      })
    }
  })
}

async function waitForRelationalBootstrap() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error('Timed out while waiting for relational data bootstrap to complete')
}

async function ensureRelationalData() {
  if ((await prisma.user.count()) > 0) {
    return
  }

  try {
    await prisma.appState.create({
      data: {
        id: RELATIONAL_BOOTSTRAP_LOCK_ID,
        payload: toPrismaJson({ status: 'bootstrapping', startedAt: new Date().toISOString() }),
      },
    })
  } catch (error) {
    if (isPrismaKnownError(error, 'P2002')) {
      await waitForRelationalBootstrap()
      return
    }

    throw error
  }

  try {
    if ((await prisma.user.count()) === 0) {
      const legacyData = await readLegacyAppStateFromDatabase()
      const seedData = legacyData ?? createSeedData()
      await persistRelationalAppData(seedData)
    }
  } catch (error) {
    await prisma.appState
      .delete({
        where: { id: RELATIONAL_BOOTSTRAP_LOCK_ID },
      })
      .catch(() => undefined)

    throw error
  }
}

export async function readAppData(): Promise<AppData> {
  if (hasDatabaseUrl()) {
    await ensureRelationalData()
    await ensureSeedAdminPassword()
    return readRelationalAppData()
  }

  await ensureDataFile()
  const raw = await readFile(DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw) as AppData
  const normalized = normalizeData(parsed)

  if (normalized.changed) {
    await writeFile(DATA_FILE, JSON.stringify(normalized.data, null, 2), 'utf8')
  }

  return normalized.data
}

export async function updateAppData<T>(updater: (data: AppData) => T | Promise<T>) {
  const next = writeQueue.then(async () => {
    const data = await readAppData()
    const result = await updater(data)

    if (hasDatabaseUrl()) {
      await persistRelationalAppData(data)
      return result
    }

    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    return result
  })

  writeQueue = next.then(
    () => undefined,
    () => undefined
  )

  return next
}

export async function listExperiencesFromStore() {
  const data = await readAppData()
  const operatorsById = new Map(data.operators.map((operator) => [operator.id, operator]))

  return data.experiences.map((experience) => hydrateExperience(experience, operatorsById))
}

export async function listStoredExperiences() {
  const data = await readAppData()
  return data.experiences
}

export async function getExperienceFromStore(id: string) {
  const data = await readAppData()
  const operatorsById = new Map(data.operators.map((operator) => [operator.id, operator]))
  const experience = data.experiences.find((item) => item.id === id)

  return experience ? hydrateExperience(experience, operatorsById) : null
}

function normalizeBookingStatus(status: BookingManagementStatus): BookingStatus {
  if (status === 'in-progress') {
    return 'confirmed'
  }

  if (status === 'completed') {
    return 'completed'
  }

  return status
}

export async function listTouristBookingsFromStore(touristId = DEFAULT_TOURIST_ID) {
  const data = await readAppData()
  const experiencesById = new Map(data.experiences.map((experience) => [experience.id, experience]))
  const operatorsById = new Map(data.operators.map((operator) => [operator.id, operator]))
  const disputesByBookingId = new Map(
    data.disputes.map((dispute) => [dispute.bookingId, dispute])
  )

  const bookings = data.bookings
    .filter((booking) => booking.touristId === touristId)
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())

  return bookings.map((booking): TouristBookingRecord => {
    const experience = experiencesById.get(booking.experienceId)

    if (!experience) {
      throw new Error(`Missing experience ${booking.experienceId} for booking ${booking.id}`)
    }

    const operator = operatorsById.get(experience.operatorId)

    if (!operator) {
      throw new Error(`Missing operator ${experience.operatorId} for booking ${booking.id}`)
    }

    const dispute = disputesByBookingId.get(booking.id)

    return {
      id: booking.id,
      experienceId: booking.experienceId,
      experienceName: experience.title,
      operatorId: operator.id,
      operatorName: operator.name,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: normalizeBookingStatus(booking.status),
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

export async function listOperatorBookingsFromStore(operatorId = DEFAULT_OPERATOR_ID) {
  const data = await readAppData()
  const experiencesById = new Map(data.experiences.map((experience) => [experience.id, experience]))
  const usersById = new Map(data.users.map((user) => [user.id, user]))

  const bookings = data.bookings
    .filter((booking) => {
      const experience = experiencesById.get(booking.experienceId)
      return experience?.operatorId === operatorId
    })
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())

  return bookings.map((booking): OperatorBookingRecord => {
    const experience = experiencesById.get(booking.experienceId)

    if (!experience) {
      throw new Error(`Missing experience ${booking.experienceId} for booking ${booking.id}`)
    }

    const guest = usersById.get(booking.touristId)

    if (!guest) {
      throw new Error(`Missing tourist ${booking.touristId} for booking ${booking.id}`)
    }

    return {
      id: booking.id,
      experienceId: booking.experienceId,
      experienceName: experience.title,
      guestName: guest.name,
      guestEmail: guest.email,
      bookingDate: booking.bookingDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      notes: booking.notes,
      bookedAt: booking.bookedAt,
    }
  })
}

export function getDefaultViewerIds() {
  return {
    touristId: DEFAULT_TOURIST_ID,
    operatorId: DEFAULT_OPERATOR_ID,
  }
}

export async function listUsersFromStore() {
  const data = await readAppData()
  return data.users
}

export async function getUserFromStore(id: string) {
  const data = await readAppData()
  return data.users.find((user) => user.id === id) ?? null
}

export async function updateUserProfileInStore(
  id: string,
  updates: {
    name: string
    email: string
    avatar?: string
    phone?: string
    bio?: string
  }
) {
  if (hasDatabaseUrl()) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })

    if (!existing) {
      throw new Error('User not found')
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: updates.name,
          email: updates.email,
          avatar: updates.avatar ?? undefined,
        },
      })

      if (existing.role === 'operator') {
        const operator = await tx.operatorProfile.findUnique({
          where: { userId: id },
          select: { userId: true },
        })

        if (!operator) {
          throw new Error('Operator profile not found')
        }

        await tx.operatorProfile.update({
          where: { userId: id },
          data: {
            name: updates.name,
            email: updates.email,
            avatar: updates.avatar ?? undefined,
            phone: updates.phone ?? undefined,
            bio: updates.bio ?? undefined,
          },
        })
      }
    })

    return getUserFromStore(id)
  }

  return updateAppData((data) => {
    const user = data.users.find((item) => item.id === id)

    if (!user) {
      throw new Error('User not found')
    }

    user.name = updates.name
    user.email = updates.email
    user.avatar = updates.avatar || user.avatar

    if (user.role === 'operator') {
      const operator = data.operators.find((item) => item.id === id)

      if (!operator) {
        throw new Error('Operator profile not found')
      }

      operator.name = updates.name
      operator.email = updates.email
      operator.avatar = updates.avatar || operator.avatar
      operator.phone = updates.phone || operator.phone
      operator.bio = updates.bio || operator.bio
    }

    return user
  })
}

export async function findUserByEmailFromStore(email: string) {
  const data = await readAppData()
  return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function createUserInStore(input: {
  name: string
  email: string
  password: string
  role: 'tourist' | 'operator'
}) {
  if (hasDatabaseUrl()) {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: input.email, mode: 'insensitive' } },
      select: { id: true },
    })

    if (existing) {
      throw new Error('An account with that email already exists')
    }

    const userId = `${input.role}-${Date.now()}`
    const createdAt = new Date()
    const avatar = `https://i.pravatar.cc/300?u=${encodeURIComponent(input.email)}`

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          name: input.name,
          email: input.email,
          role: input.role,
          avatar,
          createdAt,
          onboardingPreferences: toPrismaJson(null),
          accountSettings: toPrismaJson(getDefaultAccountSettings()),
          passwordHash: hashPassword(input.password),
        },
      })

      if (input.role === 'operator') {
        await tx.operatorProfile.create({
          data: {
            userId,
            name: input.name,
            email: input.email,
            phone: '',
            bio: 'New operator on AfriConnect.',
            avatar,
            rating: 0,
            reviewCount: 0,
            joinDate: createdAt,
            verificationStatus: 'pending',
          },
        })
      }
    })

    const user = await getUserFromStore(userId)

    if (!user) {
      throw new Error('User could not be created')
    }

    return user
  }

  return updateAppData((data) => {
    const existing = data.users.find(
      (user) => user.email.toLowerCase() === input.email.toLowerCase()
    )

    if (existing) {
      throw new Error('An account with that email already exists')
    }

    const userId = `${input.role}-${Date.now()}`
    const createdAt = new Date().toISOString()

    data.users.push({
      id: userId,
      name: input.name,
      email: input.email,
      role: input.role,
      avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(input.email)}`,
      createdAt,
      savedExperienceIds: [],
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash: hashPassword(input.password),
    })

    if (input.role === 'operator') {
      data.operators.push({
        id: userId,
        name: input.name,
        email: input.email,
        phone: '',
        bio: 'New operator on AfriConnect.',
        avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(input.email)}`,
        rating: 0,
        reviewCount: 0,
        joinDate: createdAt,
        verificationStatus: 'pending',
      })
    }

    return data.users[data.users.length - 1]
  })
}

export async function getAccountSettingsFromStore(id: string) {
  const user = await getUserFromStore(id)
  return user?.accountSettings ?? getDefaultAccountSettings()
}

export async function saveAccountSettingsToStore(id: string, settings: AccountSettings) {
  if (hasDatabaseUrl()) {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      throw new Error('User not found')
    }

    await prisma.user.update({
      where: { id },
      data: {
        accountSettings: toPrismaJson(settings),
      },
    })

    return settings
  }

  return updateAppData((data) => {
    const user = data.users.find((item) => item.id === id)

    if (!user) {
      throw new Error('User not found')
    }

    user.accountSettings = settings
    return user.accountSettings
  })
}

export async function getOperatorProfileFromStore(id: string) {
  const data = await readAppData()
  return data.operators.find((operator) => operator.id === id) ?? null
}

export async function listOperatorProfilesFromStore() {
  const data = await readAppData()
  return data.operators
}

export async function listPaymentsFromStore() {
  const data = await readAppData()
  return data.payments
}

export async function listEmailEventsFromStore() {
  const data = await readAppData()
  return data.emailEvents
}

export async function listDisputesFromStore() {
  const data = await readAppData()
  return data.disputes
}
