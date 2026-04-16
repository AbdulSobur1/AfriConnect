import 'server-only'

type RateLimitRule = {
  windowMs: number
  maxRequests: number
}

type Bucket = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, Bucket>()

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()

  return forwardedFor || realIp || 'local'
}

export function enforceRateLimit(
  request: Request,
  scope: string,
  rule: RateLimitRule,
  actorId?: string
) {
  const now = Date.now()
  const identity = actorId || getClientKey(request)
  const key = `${scope}:${identity}`
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
