// macOS/Windows-style window snapping.
//
// A snap "zone" describes a region of the screen a window lands in when the
// drag pointer reaches a screen edge (or when a keyboard shortcut is used).
// Zones resolve to a concrete pixel rect that respects the OS chrome (top bar
// + dock) so snapped windows never sit under the bar or behind the dock.

export type SnapZone =
  | 'maximize'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export type SnapRect = { x: number; y: number; w: number; h: number }

// Matches windowPlacement.ts: the top bar occupies ~54px and the dock ~116px.
const topInset = 54
const bottomInset = 116
const sideMargin = 12
const gap = 8

// How close (px) the pointer must be to an edge to trigger that edge's zone.
const edgeThreshold = 28
// How tall the top maximize band is relative to the side half bands.
const cornerBand = 0.32

export function snapZoneFromPointer(
  clientX: number,
  clientY: number,
  viewportWidth: number,
  viewportHeight: number,
): SnapZone | null {
  const nearLeft = clientX <= edgeThreshold
  const nearRight = clientX >= viewportWidth - edgeThreshold
  const nearTop = clientY <= topInset + edgeThreshold

  if (nearTop && !nearLeft && !nearRight) return 'maximize'

  if (nearLeft || nearRight) {
    const side = nearLeft ? 'left' : 'right'
    const usableTop = topInset
    const usableHeight = viewportHeight - topInset - bottomInset
    const inTopBand = clientY <= usableTop + usableHeight * cornerBand
    const inBottomBand = clientY >= usableTop + usableHeight * (1 - cornerBand)

    if (inTopBand) return side === 'left' ? 'top-left' : 'top-right'
    if (inBottomBand) return side === 'left' ? 'bottom-left' : 'bottom-right'

    return side
  }

  return null
}

export function rectForZone(
  zone: SnapZone,
  viewportWidth: number,
  viewportHeight: number,
): SnapRect {
  const left = sideMargin
  const top = topInset
  const fullWidth = viewportWidth - sideMargin * 2
  const fullHeight = viewportHeight - topInset - bottomInset
  const halfWidth = Math.round((fullWidth - gap) / 2)
  const halfHeight = Math.round((fullHeight - gap) / 2)
  const rightX = left + halfWidth + gap
  const bottomY = top + halfHeight + gap

  switch (zone) {
    case 'maximize':
      return { x: left, y: top, w: fullWidth, h: fullHeight }
    case 'left':
      return { x: left, y: top, w: halfWidth, h: fullHeight }
    case 'right':
      return { x: rightX, y: top, w: halfWidth, h: fullHeight }
    case 'top-left':
      return { x: left, y: top, w: halfWidth, h: halfHeight }
    case 'top-right':
      return { x: rightX, y: top, w: halfWidth, h: halfHeight }
    case 'bottom-left':
      return { x: left, y: bottomY, w: halfWidth, h: halfHeight }
    case 'bottom-right':
      return { x: rightX, y: bottomY, w: halfWidth, h: halfHeight }
  }
}

// Maps a Ctrl/Cmd + Arrow keypress to a snap zone, honoring an optional Shift
// modifier for quarter tiling. Left/Right → halves (+Shift narrows by the
// window's current vertical half), Up → maximize, Down → restore (null zone
// handled by the caller).
export function snapZoneFromArrow(
  key: string,
  withShift: boolean,
): SnapZone | 'restore' | null {
  if (key === 'ArrowUp') return 'maximize'
  if (key === 'ArrowDown') return 'restore'
  if (key === 'ArrowLeft') return withShift ? 'top-left' : 'left'
  if (key === 'ArrowRight') return withShift ? 'top-right' : 'right'

  return null
}
