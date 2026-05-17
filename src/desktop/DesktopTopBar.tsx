import { Battery, Search, Wifi } from 'lucide-react'

const menuButtonClass =
  'cursor-pointer appearance-none whitespace-nowrap border-0 bg-transparent font-[inherit] text-window font-extrabold text-os-ink-muted max-[900px]:hidden'

type DesktopTopBarProps = {
  commandOpen: boolean
  onOpenCommand: () => void
  onOpenHelp: () => void
  onOpenHome: () => void
}

export function DesktopTopBar({
  commandOpen,
  onOpenCommand,
  onOpenHelp,
  onOpenHome,
}: DesktopTopBarProps) {
  return (
    <header
      className="relative z-[2147483000] grid h-titlebar grid-cols-[minmax(0,1fr)_minmax(180px,340px)_minmax(0,1fr)] items-center gap-4 border-b border-os-border bg-os-glass px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-[18px] max-[900px]:grid-cols-[auto_minmax(180px,1fr)_auto] max-[900px]:gap-3 max-[640px]:grid-cols-[1fr_auto]"
      onContextMenu={(event) => event.stopPropagation()}
    >
      <div className="flex min-w-0 items-center gap-2">
        <img
          className="size-[1.55rem] rounded-full border border-white/80 object-cover object-[50%_31%] shadow-os-logo"
          src="/felix-portrait.jpg"
          alt="Felix Wohnhaas"
        />
        <strong className="whitespace-nowrap">FelixOS</strong>
        <button type="button" className={menuButtonClass} onClick={onOpenHome}>
          File
        </button>
        <button type="button" className={menuButtonClass}>
          View
        </button>
        <button type="button" className={menuButtonClass} onClick={onOpenHelp}>
          Help
        </button>
      </div>
      <button
        type="button"
        className="flex min-h-7 w-full min-w-0 cursor-pointer appearance-none items-center justify-center gap-2 justify-self-center rounded-full border border-os-border bg-white/55 px-3 text-meta font-bold text-os-ink-soft transition hover:border-os-border-strong hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 max-[640px]:hidden"
        onClick={onOpenCommand}
        aria-label="Search Felix's computer"
        aria-haspopup="dialog"
        aria-expanded={commandOpen}
      >
        <Search aria-hidden="true" size={15} />
        <span className="truncate">Search Felix&apos;s computer</span>
        <kbd className="ml-auto inline-flex h-5 min-w-[2.55rem] items-center justify-center gap-1 rounded-[6px] border border-os-border bg-white/70 px-2 text-[0.72rem] font-black leading-none text-os-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <span className="text-[0.92rem] leading-none">⌘</span>
          <span>K</span>
        </kbd>
      </button>
      <div className="flex items-center gap-2.5 justify-self-end text-window font-extrabold text-os-ink-muted">
        <Wifi aria-hidden="true" size={16} />
        <Battery aria-hidden="true" size={17} />
        <time dateTime="2026-05-04T13:30">13:30</time>
      </div>
    </header>
  )
}
