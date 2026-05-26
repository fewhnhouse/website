export const desktopStorageKey = 'felixos.desktop.settings'
export const desktopSettingsVersion = 1

// Pixel-mode wallpapers — flat cream canvas + 16px pixel grid. Each option
// just tints the grid line color and (optionally) the canvas, keeping the
// stamped graph-paper look from the design handoff. No more glass gradients.
const PIXEL_GRID_16 = (color: string) =>
  `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`

export const wallpaperOptions = [
  {
    id: 'paper',
    name: 'Paper',
    shell: '#F0EEE6',
    wallpaper: PIXEL_GRID_16('rgba(31, 30, 29, 0.13)'),
    desktopIcon: '#1F1E1D',
    desktopIconSoft: 'rgba(31, 30, 29, 0.56)',
    desktopTileIcon: '#1F1E1D',
    desktopTile: '#FAF9F5',
  },
  {
    id: 'coral-tint',
    name: 'Coral Tint',
    shell: '#F4E8DF',
    wallpaper: PIXEL_GRID_16('rgba(188, 90, 60, 0.18)'),
    desktopIcon: '#1F1E1D',
    desktopIconSoft: 'rgba(31, 30, 29, 0.56)',
    desktopTileIcon: '#1F1E1D',
    desktopTile: '#FAF9F5',
  },
  {
    id: 'moss',
    name: 'Moss',
    shell: '#E8EBE0',
    wallpaper: PIXEL_GRID_16('rgba(92, 122, 83, 0.2)'),
    desktopIcon: '#1F1E1D',
    desktopIconSoft: 'rgba(31, 30, 29, 0.56)',
    desktopTileIcon: '#1F1E1D',
    desktopTile: '#FAF9F5',
  },
  {
    id: 'ink',
    name: 'Ink',
    shell: '#1F1E1D',
    wallpaper: PIXEL_GRID_16('rgba(250, 249, 245, 0.12)'),
    desktopIcon: '#FAF9F5',
    desktopIconSoft: 'rgba(250, 249, 245, 0.56)',
    desktopTileIcon: '#FAF9F5',
    desktopTile: '#29261B',
  },
] as const

export const screensaverOptions = [
  {
    id: 'dvd',
    name: 'DVD Logo',
    description: 'Classic corner-hunting bounce',
  },
] as const

export type WallpaperId = (typeof wallpaperOptions)[number]['id']
export type ScreensaverId = (typeof screensaverOptions)[number]['id']
export type ScreensaverMode = 'idle' | 'preview'

export type DesktopSettings = {
  version: typeof desktopSettingsVersion
  screensaverMinutes: number
  screensaver: ScreensaverId
  wallpaper: WallpaperId
}

export const defaultDesktopSettings: DesktopSettings = {
  version: desktopSettingsVersion,
  screensaverMinutes: 5,
  screensaver: 'dvd',
  wallpaper: 'paper',
}

export function parseDesktopSettings(value: string | null): DesktopSettings {
  if (!value) return defaultDesktopSettings

  try {
    const parsed = JSON.parse(value) as Partial<DesktopSettings>
    const wallpaper = isWallpaperId(parsed.wallpaper)
      ? parsed.wallpaper
      : defaultDesktopSettings.wallpaper
    const screensaver = isScreensaverId(parsed.screensaver)
      ? parsed.screensaver
      : defaultDesktopSettings.screensaver
    const screensaverMinutes =
      typeof parsed.screensaverMinutes === 'number'
        ? Math.min(10, Math.max(1, Math.round(parsed.screensaverMinutes)))
        : defaultDesktopSettings.screensaverMinutes

    return {
      version: desktopSettingsVersion,
      screensaverMinutes,
      screensaver,
      wallpaper,
    }
  } catch {
    return defaultDesktopSettings
  }
}

export function isWallpaperId(value: unknown): value is WallpaperId {
  return wallpaperOptions.some((option) => option.id === value)
}

export function isScreensaverId(value: unknown): value is ScreensaverId {
  return screensaverOptions.some((option) => option.id === value)
}
