import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitRule = {
  windowMs: number
  maxRequests: number
}

type Bucket = {
  count: number
  resetAt: number
}

type EnforceRateLimitOptions = {
  actorId?: string
  keyParts?: Array<string | number | boolean | null | undefined>
}

const rateLimitBuckets = new Map<string, Bucket>()

let sharedRedis: Redis | null = null
const rateLimiters = new Map<string, Ratelimit>()

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()

  return forwardedFor || realIp || 'local'
}

function getRedis() {
  if (sharedRedis) {
    return sharedRedis
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  sharedRedis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  return sharedRedis
}

function getLimiter(scope: string, rule: RateLimitRule) {
  const limiterKey = `${scope}:${rule.maxRequests}:${rule.windowMs}`
  const existing = rateLimiters.get(limiterKey)

  if (existing) {
    return existing
  }

  const redis = getRedis()

  if (!redis) {
    return null
  }

  const seconds = Math.max(1, Math.ceil(rule.windowMs / 1000))
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rule.maxRequests, `${seconds} s`),
    analytics: true,
    prefix: `africonnect:${scope}`,
  })

  rateLimiters.set(limiterKey, limiter)
  return limiter
}

function buildIdentifier(
  request: Request,
  scope: string,
  options: EnforceRateLimitOptions = {}
) {
  const identity = options.actorId || getClientKey(request)
  const extras = (options.keyParts ?? [])
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part) => String(part).trim().toLowerCase())

  return [scope, String(identity).trim().toLowerCase(), ...extras].join(':')
}

function enforceInMemoryLimit(key: string, rule: RateLimitRule) {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rule.windowMs,
    })
    return
  }

  if (bucket.count >= rule.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    throw new Error(`Too many requests. Please retry in ${retryAfterSeconds} seconds.`)
  }

  bucket.count += 1
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  rule: RateLimitRule,
  options: string | EnforceRateLimitOptions = {}
) {
  const normalizedOptions =
    typeof options === 'string' ? { actorId: options } : options

  const identifier = buildIdentifier(request, scope, normalizedOptions)
  const limiter = getLimiter(scope, rule)

  if (!limiter) {
    enforceInMemoryLimit(identifier, rule)
    return
  }

  const result = await limiter.limit(identifier)

  if (!result.success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    throw new Error(`Too many requests. Please retry in ${retryAfterSeconds} seconds.`)
  }
}
