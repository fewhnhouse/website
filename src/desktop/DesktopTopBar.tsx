import { useEffect, useState } from 'react'

import { Battery, Search, Wifi } from '@/components/PixelIcon'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'

type DesktopTopBarProps = {
  commandOpen: boolean
  onOpenBrowser: () => void
  onOpenCommand: () => void
  onOpenCv: () => void
  onOpenHelp: () => void
  onOpenHome: () => void
  onOpenSettings: () => void
  onOpenTerminal: () => void
  onPreviewScreensaver: () => void
}

// Pads single digits to "08" so the menubar clock width stays stable.
function formatClock(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Initial render uses real time; on SSR we render the placeholder
    // (avoids hydration mismatch from rendering a server-side timestamp).
    setNow(new Date())

    // Align the first tick to the next minute boundary so the clock
    // updates in step with wall-clock minutes, then poll every 60s.
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: number | null = null
    const timeoutId = window.setTimeout(() => {
      setNow(new Date())
      intervalId = window.setInterval(() => setNow(new Date()), 60_000)
    }, msUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [])

  return now
}

export function DesktopTopBar({
  commandOpen,
  onOpenBrowser,
  onOpenCommand,
  onOpenCv,
  onOpenHelp,
  onOpenHome,
  onOpenSettings,
  onOpenTerminal,
  onPreviewScreensaver,
}: DesktopTopBarProps) {
  const now = useLiveClock()
  const timeLabel = now ? formatClock(now) : '--:--'
  const dateTime = now ? now.toISOString() : undefined

  return (
    <header
      className="relative z-[2147483000] grid h-titlebar grid-cols-[minmax(0,1fr)_minmax(180px,340px)_minmax(0,1fr)] items-center gap-4 border-b-2 border-ink bg-foam px-3.5 max-[900px]:grid-cols-[auto_minmax(180px,1fr)_auto] max-[900px]:gap-3 max-[640px]:grid-cols-[1fr_auto]"
      onContextMenu={(event) => event.stopPropagation()}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <img
          className="size-[1.55rem] border-2 border-ink object-cover object-[50%_31%] shadow-chip"
          src="/felix-portrait.jpg"
          alt="Felix Wohnhaas"
        />
        <strong className="whitespace-nowrap font-display text-[0.82rem] font-normal uppercase tracking-[0.08em] text-ink">
          FelixOS
        </strong>
        <Menubar className="max-[900px]:hidden">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={onOpenHome}>
                Open home.mdx
                <MenubarShortcut>⏎</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onSelect={onOpenCv}>Open cv.mdx</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onSelect={onOpenBrowser}>New browser tab</MenubarItem>
              <MenubarItem onSelect={onOpenTerminal}>New terminal</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={onOpenSettings}>Wallpaper…</MenubarItem>
              <MenubarItem onSelect={onPreviewScreensaver}>Run screensaver</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onSelect={onOpenCommand}>
                Search…
                <MenubarShortcut>⌘K</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={onOpenHelp}>FelixOS guide</MenubarItem>
              <MenubarItem onSelect={onOpenCommand}>
                Search apps
                <MenubarShortcut>⌘K</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <button
        type="button"
        className="flex min-h-8 w-full min-w-0 cursor-pointer appearance-none items-center justify-center gap-2 justify-self-center border-2 border-ink bg-foam px-3 font-mono text-[0.78rem] font-bold text-ink-soft transition-colors hover:bg-link-hover-bg [box-shadow:inset_2px_2px_0_0_rgba(31,30,29,0.08)] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--lagoon)] max-[640px]:hidden"
        onClick={onOpenCommand}
        aria-label="Search Felix's computer"
        aria-haspopup="dialog"
        aria-expanded={commandOpen}
      >
        <Search aria-hidden="true" size={14} />
        <span className="truncate">Search Felix&apos;s computer</span>
        <kbd className="ml-auto inline-flex h-5 min-w-[2.55rem] items-center justify-center gap-1 border-2 border-ink bg-foam px-1.5 font-mono text-[0.7rem] font-bold leading-none text-ink">
          <span className="text-[0.88rem] leading-none">⌘</span>
          <span>K</span>
        </kbd>
      </button>
      <div className="flex items-center gap-2.5 justify-self-end text-ink">
        <Wifi aria-hidden="true" size={16} />
        <Battery aria-hidden="true" size={17} />
        <time
          className="font-mono text-window font-bold tabular-nums"
          dateTime={dateTime}
          suppressHydrationWarning
        >
          {timeLabel}
        </time>
      </div>
    </header>
  )
}
