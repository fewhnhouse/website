// Lightweight in-memory rate limiter + global daily kill-switch.
//
// NOTE: This state lives in the serverless instance's memory, so it resets on
// cold starts and is NOT shared across instances. It's a sane floor for a
// portfolio endpoint, but for real abuse protection it should be replaced with
// a KV-backed limiter (Vercel KV / Upstash). See report TODO.

type Bucket = {
  minuteCount: number
  minuteResetAt: number
  dayCount: number
  dayResetAt: number
}

const MINUTE = 60 * 1000
const DAY = 24 * 60 * 60 * 1000

const PER_IP_PER_MINUTE = 10
const PER_IP_PER_DAY = 50

const buckets = new Map<string, Bucket>()

// Global daily counter (the kill-switch ceiling).
let globalDayCount = 0
let globalDayResetAt = 0

function globalDailyLimit(): number {
  const raw = Number(process.env.ASK_FELIX_DAILY_LIMIT)
  return Number.isFinite(raw) && raw > 0 ? raw : 500
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'ip' | 'global'; retryAfterSeconds: number }

/**
 * Records a request from the given IP and returns whether it is allowed.
 * Increments counters only when the request is allowed.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()

  // Global daily kill-switch (checked first — protects against total spend).
  if (now >= globalDayResetAt) {
    globalDayCount = 0
    globalDayResetAt = now + DAY
  }
  if (globalDayCount >= globalDailyLimit()) {
    return {
      ok: false,
      reason: 'global',
      retryAfterSeconds: Math.ceil((globalDayResetAt - now) / 1000),
    }
  }

  let bucket = buckets.get(ip)
  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteResetAt: now + MINUTE,
      dayCount: 0,
      dayResetAt: now + DAY,
    }
    buckets.set(ip, bucket)
  }

  if (now >= bucket.minuteResetAt) {
    bucket.minuteCount = 0
    bucket.minuteResetAt = now + MINUTE
  }
  if (now >= bucket.dayResetAt) {
    bucket.dayCount = 0
    bucket.dayResetAt = now + DAY
  }

  if (bucket.minuteCount >= PER_IP_PER_MINUTE) {
    return {
      ok: false,
      reason: 'ip',
      retryAfterSeconds: Math.ceil((bucket.minuteResetAt - now) / 1000),
    }
  }
  if (bucket.dayCount >= PER_IP_PER_DAY) {
    return {
      ok: false,
      reason: 'ip',
      retryAfterSeconds: Math.ceil((bucket.dayResetAt - now) / 1000),
    }
  }

  bucket.minuteCount += 1
  bucket.dayCount += 1
  globalDayCount += 1

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (now >= value.dayResetAt) buckets.delete(key)
    }
  }

  return { ok: true }
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
