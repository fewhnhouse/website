export const desktopStorageKey = 'felixos.desktop.settings'
export const desktopSettingsVersion = 1

export const wallpaperOptions = [
  {
    id: 'aurora',
    name: 'Aurora',
    shell:
      'linear-gradient(135deg, #f7fbff 0%, #c8f4e8 32%, #9db7ff 68%, #f5bfd6 100%)',
    wallpaper: 'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0))',
    desktopIcon: '#14262d',
    desktopIconSoft: 'rgba(20, 38, 45, 0.58)',
    desktopTileIcon: '#14262d',
    desktopTile:
      'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.18)), linear-gradient(135deg, color-mix(in oklab, var(--accent) 82%, white), var(--accent))',
  },
  {
    id: 'daybreak',
    name: 'Daybreak',
    shell:
      'linear-gradient(135deg, #fff7d6 0%, #ffc6a8 34%, #ff8fb8 68%, #8b9cff 100%)',
    wallpaper: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.04))',
    desktopIcon: '#14262d',
    desktopIconSoft: 'rgba(20, 38, 45, 0.58)',
    desktopTileIcon: '#14262d',
    desktopTile:
      'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.18)), linear-gradient(135deg, color-mix(in oklab, var(--accent) 82%, white), var(--accent))',
  },
  {
    id: 'pacific',
    name: 'Pacific',
    shell:
      'linear-gradient(135deg, #eaf7ff 0%, #8de5db 30%, #4fa6d8 65%, #263f8f 100%)',
    wallpaper: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))',
    desktopIcon: '#14262d',
    desktopIconSoft: 'rgba(20, 38, 45, 0.58)',
    desktopTileIcon: '#14262d',
    desktopTile:
      'linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.18)), linear-gradient(135deg, color-mix(in oklab, var(--accent) 82%, white), var(--accent))',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    shell:
      'linear-gradient(135deg, #071416 0%, #14262d 34%, #274b67 68%, #6f7cff 100%)',
    wallpaper: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0))',
    desktopIcon: '#f4fbff',
    desktopIconSoft: 'rgba(244, 251, 255, 0.72)',
    desktopTileIcon: '#f4fbff',
    desktopTile:
      'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08)), linear-gradient(135deg, color-mix(in oklab, var(--accent) 44%, #ffffff), color-mix(in oklab, var(--accent) 70%, #071416))',
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
  wallpaper: 'aurora',
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
