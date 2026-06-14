// Entries are stored HTML-escaped at rest (defense in depth). React already
// escapes text nodes, so for display we decode the entities back to the
// original characters and let React handle safe rendering.
export function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: 'day', ms: 1000 * 60 * 60 * 24 },
  { unit: 'hour', ms: 1000 * 60 * 60 },
  { unit: 'minute', ms: 1000 * 60 },
]

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return ''

  const diff = time - now
  const abs = Math.abs(diff)
  if (abs < 1000 * 45) return 'just now'

  for (const { unit, ms } of units) {
    if (abs >= ms) {
      return relativeFormatter.format(Math.round(diff / ms), unit)
    }
  }
  return 'just now'
}
