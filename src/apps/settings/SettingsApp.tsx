import { Check, Clock3, Image, Play } from '@/components/PixelIcon'
import type { CSSProperties } from 'react'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/cn'

import {
  osAppHeight,
  osAppShellClass,
  osBtnSmClass,
  osChipClass,
  osPanelClass,
  osScrollClass,
} from '@/apps/shared/appStyles'

type WallpaperOption = {
  id: string
  name: string
  shell: string
  wallpaper: string
}

type SettingsAppProps = {
  screensaverMinutes: number
  selectedWallpaper: string
  wallpaperOptions: readonly WallpaperOption[]
  onPreviewScreensaver: () => void
  onScreensaverMinutesChange: (minutes: number) => void
  onWallpaperChange: (wallpaper: string) => void
}

export function SettingsApp({
  screensaverMinutes,
  selectedWallpaper,
  wallpaperOptions,
  onPreviewScreensaver,
  onScreensaverMinutesChange,
  onWallpaperChange,
}: SettingsAppProps) {
  return (
    <section className={cn(osAppShellClass, osAppHeight.compact)} aria-label="Desktop settings">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">SETTINGS</p>
          <strong className="os-section-header__title">Desktop preferences</strong>
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
        <div className="grid gap-4">
          <section className={osPanelClass}>
            <h2 className="m-0 flex items-center gap-2 text-[0.82rem] font-black text-ink">
              <Image aria-hidden="true" size={16} />
              Background
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-2 max-[760px]:grid-cols-2">
              {wallpaperOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    'grid gap-2 border-2 p-2 text-left font-[inherit] transition',
                    selectedWallpaper === option.id
                      ? 'border-ink bg-foam shadow-chip'
                      : 'border-ink bg-foam/60 hover:bg-foam hover:shadow-chip',
                  )}
                  onClick={() => onWallpaperChange(option.id)}
                >
                  <span
                    className="relative block aspect-[1.45] overflow-hidden border-2 border-ink bg-[color:var(--preview-shell)] after:absolute after:inset-0 after:bg-[image:var(--preview-wallpaper)] after:bg-[length:8px_8px] after:content-['']"
                    style={
                      {
                        '--preview-shell': option.shell,
                        '--preview-wallpaper': option.wallpaper,
                      } as CSSProperties
                    }
                  />
                  <span className="flex items-center justify-between gap-2 text-caption font-black uppercase tracking-[0.06em] text-ink">
                    {option.name}
                    {selectedWallpaper === option.id ? <Check aria-hidden="true" size={14} /> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={osPanelClass}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 flex items-center gap-2 text-[0.82rem] font-black text-ink">
                <Clock3 aria-hidden="true" size={16} />
                Screensaver
              </h2>
              <button
                type="button"
                className={osBtnSmClass}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  onPreviewScreensaver()
                }}
                onClick={onPreviewScreensaver}
              >
                <Play aria-hidden="true" size={14} />
                Preview
              </button>
            </div>

            <div className="mt-3 os-panel--sunken p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <strong className="block font-display text-[0.78rem] font-normal uppercase tracking-[0.06em] text-ink">DVD logo</strong>
                  <span className="text-caption font-extrabold text-ink-soft">
                    Classic corner-hunting bounce.
                  </span>
                </div>
                <span className={cn(osChipClass, 'os-chip--coral')}>Active</span>
              </div>
              <div className="mb-3 flex items-center justify-between gap-3 border-t-2 border-ink pt-3">
                <span className="text-window font-black text-ink">Start after inactivity</span>
                <span className={cn(osChipClass, 'font-mono')}>{screensaverMinutes} min</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[screensaverMinutes]}
                onValueChange={([value]) => onScreensaverMinutesChange(value ?? screensaverMinutes)}
                aria-label="Screensaver start time in minutes"
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
