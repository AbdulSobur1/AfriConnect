import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

interface StoredExperience extends Omit<Experience, 'operator' | 'createdAt' | 'updatedAt' | 'availability'> {
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

function makeSeedExperience(experience: Experience): Experience {
  return {
    ...experience,
    status: 'published',
    adminNotes: 'Seeded approved experience',
  }
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'app-data.json')

const DEFAULT_OPERATOR_ID = mockOperators[0].id
const DEFAULT_TOURIST_ID = mockCurrentUser.id

let writeQueue: Promise<unknown> = Promise.resolve()

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
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      savedExperienceIds: [],
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash: undefined,
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

  for (const payment of data.payments) {
    if (!('experienceId' in payment)) {
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

export async function readAppData(): Promise<AppData> {
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
