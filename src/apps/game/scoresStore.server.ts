import type { RunnerScore } from './scoresTypes'

const SCORES_BLOB_PATH = 'runner/scores.json'
const TOP_N = 10
const MAX_NAME_LENGTH = 18
const MAX_SCORE = 9_999_999

export async function readScores(): Promise<RunnerScore[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return []

  const { get } = await import('@vercel/blob')
  let result: Awaited<ReturnType<typeof get>> = null
  try {
    result = await get(SCORES_BLOB_PATH, {
      access: 'private',
      token,
      useCache: false,
    })
  } catch (error) {
    if (isBlobNotFound(error)) return []
    throw error
  }

  if (!result || result.statusCode !== 200 || !result.stream) return []

  const text = await new Response(result.stream).text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return []
  }

  return normalizeScores(parsed)
}

export async function submitScore(input: unknown): Promise<RunnerScore[]> {
  const sanitized = sanitizeSubmission(input)
  if (!sanitized) {
    throw new Error('Invalid score submission')
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN')
  }

  const current = await readScores()
  const entry: RunnerScore = {
    id: `${Date.now()}-${sanitized.score}-${Math.random().toString(36).slice(2, 8)}`,
    name: sanitized.name,
    score: sanitized.score,
    submittedAt: new Date().toISOString(),
  }
  const next = [...current, entry]
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt))
    .slice(0, TOP_N)

  const { put } = await import('@vercel/blob')
  await put(SCORES_BLOB_PATH, JSON.stringify(next, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
    token,
  })

  return next
}

function sanitizeSubmission(input: unknown): { name: string; score: number } | null {
  if (!input || typeof input !== 'object') return null
  const value = input as Record<string, unknown>

  const rawScore = value.score
  if (typeof rawScore !== 'number' || !Number.isFinite(rawScore)) return null
  const score = Math.max(0, Math.min(MAX_SCORE, Math.round(rawScore)))

  const rawName = typeof value.name === 'string' ? value.name : ''
  const trimmed = rawName.trim().slice(0, MAX_NAME_LENGTH)
  const name = trimmed.length > 0 ? trimmed : 'Anonymous'

  return { name, score }
}

function normalizeScores(parsed: unknown): RunnerScore[] {
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter(isRunnerScore)
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt))
    .slice(0, TOP_N)
}

function isRunnerScore(value: unknown): value is RunnerScore {
  if (!value || typeof value !== 'object') return false
  const score = value as Record<string, unknown>
  return (
    typeof score.id === 'string' &&
    typeof score.name === 'string' &&
    typeof score.score === 'number' &&
    Number.isFinite(score.score) &&
    typeof score.submittedAt === 'string'
  )
}

function isBlobNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { constructor?: { name?: string }; message?: unknown; name?: unknown }
  const message = typeof record.message === 'string' ? record.message : ''
  const name = typeof record.name === 'string' ? record.name : ''
  const ctorName = record.constructor?.name ?? ''
  return (
    name === 'BlobNotFoundError' ||
    ctorName === 'BlobNotFoundError' ||
    /not\s*found/i.test(message) ||
    /does not exist/i.test(message)
  )
}
