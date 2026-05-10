import type { DesktopSearch } from './types'

export const defaultWindow = {
  minimized: false,
  maximized: false,
  x: 84,
  y: 92,
} satisfies DesktopSearch

export function desktopSearchValidator(search: Record<string, unknown>): DesktopSearch {
  return {
    minimized: search.minimized === true || search.minimized === 'true',
    maximized: search.maximized === true || search.maximized === 'true',
    x: parseCoordinate(search.x, defaultWindow.x),
    y: parseCoordinate(search.y, defaultWindow.y),
  }
}

export function browserSearchValidator(search: Record<string, unknown>): DesktopSearch {
  const baseSearch = desktopSearchValidator(search)
  const url = parseUrl(search.url)

  return url
    ? {
        ...baseSearch,
        url,
      }
    : baseSearch
}

function parseCoordinate(value: unknown, fallback: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return parsed
}

function parseUrl(value: unknown) {
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}
