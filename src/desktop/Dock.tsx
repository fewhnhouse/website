import { dockApps } from './apps'
import type { WindowState } from './types'

const dockButtonClass =
  'group relative grid size-dock-icon cursor-pointer appearance-none place-items-center rounded-[14px] border border-os-border bg-white/60 font-[inherit] text-ink transition hover:-translate-y-1 hover:outline-none focus-visible:-translate-y-1 focus-visible:outline-none max-[720px]:size-12'

type DockProps = {
  openAsk: () => void
  openBrowser: () => void
  openGame: () => void
  openGithub: () => void
  openHome: () => void
  openIssues: () => void
  openStrava: () => void
  openTerminal: () => void
  windows: WindowState[]
}

export function Dock({
  openAsk,
  openBrowser,
  openGame,
  openGithub,
  openHome,
  openIssues,
  openStrava,
  openTerminal,
  windows,
}: DockProps) {
  return (
    <nav
      className="absolute bottom-4 left-1/2 z-[2147483000] flex max-w-[calc(100%_-_1rem)] -translate-x-1/2 gap-1.5 rounded-dock border border-white/45 bg-os-dock p-2 shadow-dock backdrop-blur-[22px]"
      aria-label="Application dock"
      onContextMenu={(event) => event.stopPropagation()}
    >
      {dockApps.map((app) => {
        const Icon = app.icon
        const isAsk = app.id === 'ask'
        const isBrowser = app.id === 'browser'
        const isGame = app.id === 'game'
        const isNotes = app.id === 'notes'
        const isGithub = app.id === 'github'
        const isIssues = app.id === 'issues'
        const isStrava = app.id === 'strava'
        const isTerminal = app.id === 'terminal'
        const isRunning = windows.some((window) => window.app === app.id)

        return (
          <button
            key={app.id}
            type="button"
            className={`${dockButtonClass} ${
              isRunning
                ? 'after:absolute after:bottom-1 after:h-[0.32rem] after:w-[0.32rem] after:rounded-full after:bg-lagoon after:content-[""]'
                : ''
            }`}
            onClick={
              isNotes
                ? openHome
                : isAsk
                  ? openAsk
                  : isBrowser
                    ? openBrowser
                    : isGithub
                      ? openGithub
                      : isGame
                        ? openGame
                        : isIssues
                          ? openIssues
                          : isStrava
                            ? openStrava
                            : isTerminal
                              ? openTerminal
                              : undefined
            }
            aria-label={
              isNotes
                ? 'Open notes'
                : isAsk
                  ? 'Open Ask Felix'
                  : isBrowser
                    ? 'Open Browser'
                    : isGithub
                      ? 'Open GitHub'
                      : isGame
                        ? 'Open Runner'
                        : isIssues
                          ? 'Open Issues'
                          : isStrava
                            ? 'Open Strava'
                            : isTerminal
                              ? 'Open Terminal'
                              : 'Open app'
            }
          >
            <Icon aria-hidden="true" size={24} />
            <span className="pointer-events-none absolute bottom-[calc(100%_+_0.48rem)] translate-y-[3px] whitespace-nowrap border-2 border-ink bg-foam px-2 py-1 font-display text-[0.62rem] font-normal uppercase tracking-[0.08em] text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {app.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
