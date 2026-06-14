import type { GuestbookEntry } from './types'

const GUESTBOOK_BLOB_PATH = 'guestbook/entries.json'
const MAX_ENTRIES = 200
const RETURNED_ENTRIES = 100
const MAX_NAME_LENGTH = 40
const MAX_MESSAGE_LENGTH = 280
// Reject a fresh post from the same author within this window (basic anti-spam).
const RATE_LIMIT_MS = 30_000

export class GuestbookValidationError extends Error {}

export async function readEntries(): Promise<GuestbookEntry[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return []

  const { get } = await import('@vercel/blob')
  let result: Awaited<ReturnType<typeof get>> = null
  try {
    result = await get(GUESTBOOK_BLOB_PATH, {
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

  return normalizeEntries(parsed)
}

export async function submitEntry(input: unknown): Promise<GuestbookEntry> {
  const sanitized = sanitizeSubmission(input)

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN')
  }

  const current = await readEntries()

  const recentFromAuthor = current.find(
    (entry) =>
      entry.name.toLowerCase() === sanitized.name.toLowerCase() &&
      Date.now() - Date.parse(entry.createdAt) < RATE_LIMIT_MS,
  )
  if (recentFromAuthor) {
    throw new GuestbookValidationError('Slow down — you just signed the guestbook.')
  }

  const entry: GuestbookEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: sanitized.name,
    message: sanitized.message,
    createdAt: new Date().toISOString(),
  }

  // Newest first, capped so the blob can't grow without bound.
  const next = [entry, ...current].slice(0, MAX_ENTRIES)

  const { put } = await import('@vercel/blob')
  await put(GUESTBOOK_BLOB_PATH, JSON.stringify(next, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
    token,
  })

  return entry
}

function sanitizeSubmission(input: unknown): { name: string; message: string } {
  if (!input || typeof input !== 'object') {
    throw new GuestbookValidationError('Invalid submission')
  }
  const value = input as Record<string, unknown>

  // Honeypot: a hidden field bots tend to fill. Real users leave it empty.
  if (typeof value.website === 'string' && value.website.trim().length > 0) {
    throw new GuestbookValidationError('Invalid submission')
  }

  const name = sanitizeText(value.name, MAX_NAME_LENGTH)
  const message = sanitizeText(value.message, MAX_MESSAGE_LENGTH)

  if (name.length < 1) {
    throw new GuestbookValidationError('Please add your name.')
  }
  if (message.length < 1) {
    throw new GuestbookValidationError('Please write a message.')
  }

  return { name, message }
}

// Strip control characters, collapse whitespace runs, escape HTML so rendered
// text can never inject markup, and clamp to the max length.
function sanitizeText(raw: unknown, maxLength: number): string {
  const text = typeof raw === 'string' ? raw : ''
  const cleaned = text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength)
  return escapeHtml(cleaned)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeEntries(parsed: unknown): GuestbookEntry[] {
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter(isGuestbookEntry)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RETURNED_ENTRIES)
}

function isGuestbookEntry(value: unknown): value is GuestbookEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.message === 'string' &&
    typeof entry.createdAt === 'string'
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
