import { defaultWindow } from './routeState'
import type { AppId, DesktopSearch } from './types'

const desktopMargin = 12
const titlebarOffset = 54
const dockOffset = 116

export const appSizes = {
  browser: { width: 980, height: 680 },
  game: { width: 900, height: 880 },
  github: { width: 920, height: 640 },
  help: { width: 680, height: 560 },
  issues: { width: 980, height: 680 },
  notes: { width: 720, height: 620 },
  settings: { width: 720, height: 620 },
  skills: { width: 920, height: 640 },
  strava: { width: 920, height: 640 },
  terminal: { width: 760, height: 480 },
} satisfies Record<AppId, { width: number; height: number }>

export function defaultPlacementForApp(app: AppId): Pick<DesktopSearch, 'x' | 'y'> {
  if (typeof window === 'undefined') {
    return {
      x: defaultWindow.x,
      y: defaultWindow.y,
    }
  }

  return centerPlacement(app, window.innerWidth, window.innerHeight)
}

export function ensureWindowInViewport(
  app: AppId,
  placement: Pick<DesktopSearch, 'x' | 'y'>,
): Pick<DesktopSearch, 'x' | 'y'> {
  if (typeof window === 'undefined') return placement

  const { height, width } = resolvedWindowSize(app, window.innerWidth, window.innerHeight)
  const maxX = Math.max(desktopMargin, window.innerWidth - width - desktopMargin)
  const maxY = Math.max(titlebarOffset, window.innerHeight - height - desktopMargin)

  return {
    x: clamp(placement.x, desktopMargin, maxX),
    y: clamp(placement.y, titlebarOffset, maxY),
  }
}

function centerPlacement(app: AppId, viewportWidth: number, viewportHeight: number) {
  const { height, width } = resolvedWindowSize(app, viewportWidth, viewportHeight)
  const availableHeight = Math.max(
    height,
    viewportHeight - titlebarOffset - dockOffset - desktopMargin,
  )
  const centered = {
    x: Math.round((viewportWidth - width) / 2),
    y: Math.round(titlebarOffset + (availableHeight - height) / 2),
  }

  return ensurePlacementInViewport(app, centered, viewportWidth, viewportHeight)
}

function ensurePlacementInViewport(
  app: AppId,
  placement: Pick<DesktopSearch, 'x' | 'y'>,
  viewportWidth: number,
  viewportHeight: number,
) {
  const { height, width } = resolvedWindowSize(app, viewportWidth, viewportHeight)
  const maxX = Math.max(desktopMargin, viewportWidth - width - desktopMargin)
  const maxY = Math.max(titlebarOffset, viewportHeight - height - desktopMargin)

  return {
    x: clamp(placement.x, desktopMargin, maxX),
    y: clamp(placement.y, titlebarOffset, maxY),
  }
}

function resolvedWindowSize(app: AppId, viewportWidth: number, viewportHeight: number) {
  const preferred = appSizes[app]
  const horizontalMargin = viewportWidth <= 720 ? 16 : 24
  const maxHeightOffset = viewportWidth <= 720 ? 134 : 116

  return {
    width: Math.min(preferred.width, Math.max(0, viewportWidth - horizontalMargin)),
    height: Math.min(preferred.height, Math.max(0, viewportHeight - maxHeightOffset)),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}
