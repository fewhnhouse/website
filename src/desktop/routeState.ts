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

function parseCoordinate(value: unknown, fallback: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return Math.max(16, Math.min(parsed, 620))
}
