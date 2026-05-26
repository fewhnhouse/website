import {
  Activity,
  AppWindow,
  CircleDot,
  CircleHelp,
  FileText,
  Gauge,
  Gamepad2,
  Github,
  Globe2,
  MonitorCog,
  MousePointer2,
  Search,
  Terminal,
  TerminalSquare,
  type PixelIconComponent,
} from '@/components/PixelIcon'

import { cn } from '@/lib/cn'

import {
  osAppHeight,
  osAppShellClass,
  osChipClass,
  osPanelClass,
  osScrollClass,
} from '@/apps/shared/appStyles'

// Quick orientation cards — answer "how do I drive this thing".
const navigationItems = [
  {
    title: 'Open apps',
    text: 'Click a desktop tile, the dock, the menubar Search, or use the File menu to open notes, tools, and live integrations.',
    icon: MousePointer2,
  },
  {
    title: 'Move around',
    text: 'Drag windows by their title bar. The traffic lights close, minimize, and maximize. Click an app in the dock to bring it back.',
    icon: AppWindow,
  },
  {
    title: 'Find anything',
    text: 'Press ⌘K (or Ctrl-K) to open the command palette and jump to any app or document. Results update the URL so links are shareable.',
    icon: Search,
  },
  {
    title: 'Use the shell',
    text: 'Open terminal.app for a tiny shell. Commands: help, ls, open <name>, pwd, whoami, clear. Tab-completes app names.',
    icon: TerminalSquare,
  },
] as const

// Full app directory — every shipping app, what it does, where it lives.
// Order roughly matches the dock; keyboard-only utilities sit at the end.
type AppDoc = {
  name: string
  icon: PixelIconComponent
  what: string
  open: string
}

const appDocs: AppDoc[] = [
  {
    name: 'notes.app',
    icon: FileText,
    what: 'home.mdx and cv.mdx with live preview, inline editor, reset and PDF download.',
    open: 'Dock · desktop tile · File ▸ Open home.mdx',
  },
  {
    name: 'browser.app',
    icon: Globe2,
    what: 'Embedded web view with back/forward/reload, bookmarks for Google · LinkedIn · GitHub, and an external-link escape hatch.',
    open: 'Dock · desktop tile · File ▸ New browser tab',
  },
  {
    name: 'runner.app',
    icon: Gamepad2,
    what: 'Endless offline runner. SPACE to jump, ↓ to duck. Scores persist to a global leaderboard.',
    open: 'Dock · desktop tile',
  },
  {
    name: 'terminal.app',
    icon: Terminal,
    what: 'Restricted shell: help, ls, open <name>, pwd, whoami, clear. Up/Down recall history, Tab autocompletes apps.',
    open: 'Dock · desktop tile · File ▸ New terminal',
  },
  {
    name: 'skills.app',
    icon: Gauge,
    what: 'Compact matrix of the languages, frameworks, infra and cloud services I reach for most.',
    open: 'Dock · desktop tile',
  },
  {
    name: 'github.app',
    icon: Github,
    what: 'Live profile, contribution calendar (warm coral ramp), recently updated and starred repos. Pulled from the GitHub GraphQL API.',
    open: 'Dock · desktop tile',
  },
  {
    name: 'issues.app',
    icon: CircleDot,
    what: 'Project-board view of FelixOS GitHub issues. Sign in with GitHub to file new ideas or bugs without leaving the OS.',
    open: 'Dock · desktop tile',
  },
  {
    name: 'strava.app',
    icon: Activity,
    what: 'Recent rides and runs, YTD distance / elevation / moving time. Live from the Strava API when credentials are configured.',
    open: 'Dock · desktop tile',
  },
  {
    name: 'settings.app',
    icon: MonitorCog,
    what: 'Pick a wallpaper, run the screensaver, and dial in inactivity timing. Settings persist to localStorage.',
    open: 'Right-click the desktop · View ▸ Wallpaper…',
  },
  {
    name: 'help.app',
    icon: CircleHelp,
    what: 'This guide — overview of FelixOS, every app, and the keyboard shortcuts worth knowing.',
    open: 'Top bar ▸ Help ▸ FelixOS guide',
  },
]

// Shortcuts worth memorizing — kept short so it reads at a glance.
const shortcuts: Array<[string, string]> = [
  ['⌘K · Ctrl-K', 'Open the command palette'],
  ['Esc', 'Dismiss palette / overlay'],
  ['Drag titlebar', 'Move a window'],
  ['Double-click titlebar', 'Maximize / restore'],
  ['↑ / ↓ in terminal', 'Walk through command history'],
  ['Tab in terminal', 'Autocomplete `open <app>`'],
]

export function HelpApp() {
  return (
    <section className={cn(osAppShellClass, osAppHeight.tall)} aria-label="FelixOS help">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">HELP</p>
          <strong className="os-section-header__title">Using FelixOS</strong>
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
        <header className="mb-4">
          <h2 className="m-0 font-display text-[1.4rem] font-normal lowercase tracking-normal text-ink">
            An operating system in a website
          </h2>
          <p className="mt-1.5 mb-0 max-w-[42rem] text-body-compact leading-relaxed text-ink-soft">
            FelixOS is Felix Wohnhaas&apos; personal site presented as a desktop environment.
            Instead of scrolling through a portfolio page, you open small apps that expose notes,
            projects, technical skills, live integrations, and a tiny shell.
          </p>
        </header>

        <div className="grid gap-4">
          <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1" aria-label="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className={osPanelClass}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink shadow-chip">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <h3 className="m-0 font-display text-[0.86rem] font-normal uppercase tracking-[0.06em] text-ink">
                      {item.title}
                    </h3>
                  </div>
                  <p className="m-0 text-meta leading-relaxed text-ink-soft">{item.text}</p>
                </article>
              )
            })}
          </section>

          <section className={osPanelClass} aria-label="Application directory">
            <h3 className="m-0 font-display text-[0.92rem] font-normal uppercase tracking-[0.06em] text-ink">
              Apps directory
            </h3>
            <p className="mt-1 mb-3 text-meta leading-relaxed text-ink-soft">
              Every app currently shipping in FelixOS.
            </p>
            <div className="grid gap-2">
              {appDocs.map((app) => (
                <article
                  key={app.name}
                  className="os-panel--bare grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-foam text-ink shadow-chip">
                    <app.icon aria-hidden="true" size={20} />
                  </span>
                  <div className="min-w-0">
                    <header className="flex items-baseline justify-between gap-2 max-sm:flex-col max-sm:items-start">
                      <strong className="font-mono text-meta font-extrabold text-lagoon-deep">
                        {app.name}
                      </strong>
                      <span className="font-display text-[0.6rem] font-normal uppercase tracking-[0.08em] text-ink-soft">
                        {app.open}
                      </span>
                    </header>
                    <p className="mt-1 mb-0 text-meta leading-relaxed text-ink-soft">{app.what}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={osPanelClass} aria-label="Keyboard shortcuts">
            <h3 className="m-0 font-display text-[0.92rem] font-normal uppercase tracking-[0.06em] text-ink">
              Keyboard shortcuts
            </h3>
            <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
              {shortcuts.map(([keys, description]) => (
                <div key={keys} className="contents">
                  <span className={cn(osChipClass, 'justify-self-start font-mono normal-case tracking-normal')}>
                    {keys}
                  </span>
                  <span className="self-center text-meta leading-relaxed text-ink-soft">
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
