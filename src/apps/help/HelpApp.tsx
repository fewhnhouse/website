import { AppWindow, Dock, MousePointer2, Search, TerminalSquare } from 'lucide-react'

const appShellClass =
  'flex min-h-0 flex-1 flex-col text-os-ink [max-height:calc(min(620px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:[max-height:calc(100svh_-_174px)]'
const panelClass = 'rounded-card border border-os-border bg-white/62 p-4 shadow-chip'

const navigationItems = [
  {
    title: 'Open apps',
    text: 'Use desktop icons, the dock, or the top search field to open notes, projects, live activity, and tools.',
    icon: MousePointer2,
  },
  {
    title: 'Move around',
    text: 'Drag windows by their title bars, use the traffic controls to close, minimize, or maximize them, and return through the dock.',
    icon: AppWindow,
  },
  {
    title: 'Find things',
    text: 'Press Command-K or Control-K to search FelixOS. Results open as windows and update the URL for direct links.',
    icon: Search,
  },
  {
    title: 'Use the shell',
    text: 'Open terminal.app for a small command-line interface with commands like help, ls, open, pwd, and whoami.',
    icon: TerminalSquare,
  },
] as const

const appItems = [
  ['notes.app', 'Home and CV documents with preview, edit, reset, and export controls.'],
  ['skills.app', 'A compact matrix of the languages, frameworks, infrastructure, and cloud tools Felix uses.'],
  ['github.app', 'Live GitHub activity and repository data when credentials are available.'],
  ['issues.app', 'Project-board style issue tracking for current engineering work.'],
  ['strava.app', 'Live training data and recent efforts from Strava when connected.'],
] as const

export function HelpApp() {
  return (
    <section className={appShellClass} aria-label="FelixOS help">
      <div className="border-b border-os-border bg-foam/85 px-4 py-3">
        <p className="m-0 text-caption font-black tracking-[0.14em] text-palm">HELP</p>
        <strong className="block text-[0.95rem]">Using FelixOS</strong>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-color:rgba(50,143,151,0.42)_transparent]">
        <header className="mb-4">
          <h2 className="m-0 text-[1.55rem] tracking-normal">An operating system in a website</h2>
          <p className="mt-1.5 mb-0 max-w-[42rem] text-body-compact leading-relaxed text-os-ink-muted">
            FelixOS is Felix Wohnhaas&apos; personal website presented as a desktop environment.
            Instead of scrolling through a portfolio page, you open small apps that expose notes,
            projects, technical skills, live integrations, and a tiny shell.
          </p>
        </header>

        <div className="grid gap-4">
          <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1" aria-label="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <article key={item.title} className={panelClass}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-card border border-os-border bg-[linear-gradient(145deg,rgba(96,215,207,0.24),rgba(246,200,95,0.2))] text-palm">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <h3 className="m-0 text-base tracking-normal">{item.title}</h3>
                  </div>
                  <p className="m-0 text-meta leading-relaxed text-os-ink-muted">{item.text}</p>
                </article>
              )
            })}
          </section>

          <section className={panelClass} aria-label="Available apps">
            <h3 className="m-0 text-base tracking-normal">What it can do</h3>
            <div className="mt-3 grid gap-2">
              {appItems.map(([name, description]) => (
                <article
                  key={name}
                  className="grid grid-cols-[7.5rem_1fr] gap-3 rounded-control border border-os-border bg-white/58 px-3 py-2.5 max-sm:grid-cols-1 max-sm:gap-1"
                >
                  <strong className="text-meta font-black text-os-ink">{name}</strong>
                  <p className="m-0 text-meta leading-relaxed text-os-ink-muted">{description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
