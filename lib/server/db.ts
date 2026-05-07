import 'server-only'

import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __afriConnectPrisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalThis.__afriConnectPrisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__afriConnectPrisma = prisma
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}
