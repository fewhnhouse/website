import { Check, Clock3, Image, Play } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/cn'

import { osAppHeight, osAppShellClass, osPanelClass } from '@/apps/shared/appStyles'

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
      <div className="border-b border-os-border bg-foam/85 px-4 py-3">
        <p className="m-0 text-caption font-black tracking-[0.14em] text-palm">SETTINGS</p>
        <strong className="block text-[0.95rem]">Desktop preferences</strong>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-color:rgba(50,143,151,0.42)_transparent]">
        <div className="grid gap-4">
          <section className={osPanelClass}>
            <h2 className="m-0 flex items-center gap-2 text-[0.82rem] font-black text-os-ink">
              <Image aria-hidden="true" size={16} />
              Background
            </h2>
            <div className="mt-3 grid grid-cols-4 gap-2 max-[760px]:grid-cols-2">
              {wallpaperOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    'grid gap-2 rounded-card border p-2 text-left font-[inherit] transition',
                    selectedWallpaper === option.id
                      ? 'border-lagoon bg-white/78 shadow-chip'
                      : 'border-os-border bg-white/42 hover:border-os-border-strong hover:bg-white/62',
                  )}
                  onClick={() => onWallpaperChange(option.id)}
                >
                  <span
                    className="relative block aspect-[1.45] overflow-hidden rounded-[7px] border border-white/60 bg-[image:var(--preview-shell)] shadow-chip after:absolute after:inset-0 after:bg-[image:var(--preview-wallpaper)] after:content-['']"
                    style={
                      {
                        '--preview-shell': option.shell,
                        '--preview-wallpaper': option.wallpaper,
                      } as CSSProperties
                    }
                  />
                  <span className="flex items-center justify-between gap-2 text-caption font-black text-os-ink">
                    {option.name}
                    {selectedWallpaper === option.id ? <Check aria-hidden="true" size={14} /> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={osPanelClass}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 flex items-center gap-2 text-[0.82rem] font-black text-os-ink">
                <Clock3 aria-hidden="true" size={16} />
                Screensaver
              </h2>
              <button
                type="button"
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-control border border-os-border bg-white/62 px-2.5 text-caption font-black text-os-ink hover:bg-white/82 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon/35"
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

            <div className="mt-3 rounded-card border border-os-border bg-white/52 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <strong className="block text-window font-black text-os-ink">DVD logo</strong>
                  <span className="text-caption font-extrabold text-os-ink-soft">
                    Classic corner-hunting bounce.
                  </span>
                </div>
                <span className="rounded-control border border-lagoon/45 bg-lagoon/12 px-2 py-1 text-caption font-black text-lagoon-deep">
                  Active
                </span>
              </div>
              <div className="mb-3 flex items-center justify-between gap-3 border-t border-os-border pt-3">
                <span className="text-window font-black text-os-ink">Start after inactivity</span>
                <span className="rounded-control border border-os-border bg-white/70 px-2 py-1 text-caption font-black text-os-ink-soft">
                  {screensaverMinutes} min
                </span>
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
