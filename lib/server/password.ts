import 'server-only'

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, storedHash?: string) {
  if (!storedHash) {
    return false
  }

  const [salt, key] = storedHash.split(':')

  if (!salt || !key) {
    return false
  }

  const derivedBuffer = scryptSync(password, salt, KEY_LENGTH)
  const storedBuffer = Buffer.from(key, 'hex')

  if (derivedBuffer.length !== storedBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedBuffer, storedBuffer)
}
