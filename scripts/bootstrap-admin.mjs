import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const KEY_LENGTH = 64

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derivedKey}`
}

function getDefaultAccountSettings() {
  return {
    marketingEmails: true,
    bookingReminders: true,
    smsAlerts: false,
    language: 'en',
    currency: 'USD',
    profileVisibility: 'public',
  }
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@africonnect.com').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD?.trim()
  const name = process.env.ADMIN_NAME?.trim() || 'AfriConnect Admin'

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD is required')
  }

  const passwordHash = hashPassword(password)
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        role: 'admin',
        passwordHash,
        accountSettings: getDefaultAccountSettings(),
      },
    })

    console.log(`Updated admin user: ${email}`)
    return
  }

  const userId = `admin-${Date.now()}`

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      role: 'admin',
      createdAt: new Date(),
      avatar: null,
      onboardingPreferences: null,
      accountSettings: getDefaultAccountSettings(),
      passwordHash,
    },
  })

  console.log(`Created admin user: ${email}`)
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
