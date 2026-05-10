import {
  Activity,
  Battery,
  CircleDot,
  CircleHelp,
  FileText,
  Gauge,
  Github,
  Globe2,
  MonitorCog,
  Search,
  Terminal,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, RefObject } from 'react'

import { BrowserApp } from '@/apps/browser/BrowserApp'
import { GithubApp } from '@/apps/github/GithubApp'
import { getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { HelpApp } from '@/apps/help/HelpApp'
import { IssuesApp } from '@/apps/issues/IssuesApp'
import { getIssuesBoardData } from '@/apps/issues/issuesData'
import type { IssuesBoardData, ProjectIssue } from '@/apps/issues/types'
import { initialNotesMarkdown, type NotesMarkdownByDocument } from '@/apps/notes/documents'
import { NotesApp } from '@/apps/notes/NotesApp'
import { SettingsApp } from '@/apps/settings/SettingsApp'
import { SkillsApp } from '@/apps/skills/SkillsApp'
import { StravaApp } from '@/apps/strava/StravaApp'
import { getStravaData, type StravaDataResult } from '@/apps/strava/stravaData'
import { TerminalApp } from '@/apps/terminal/TerminalApp'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { desktopApps, dockApps } from './apps'
import { CommandPalette } from './CommandPalette'
import { windowKey, type AppId, type NotesDocumentId, type RouteApp, type WindowState } from './types'
import { useDesktopWindows } from './useDesktopWindows'

const menuButtonClass =
  'cursor-pointer appearance-none whitespace-nowrap border-0 bg-transparent font-[inherit] text-window font-extrabold text-os-ink-muted max-[900px]:hidden'
const desktopIconClass =
  'grid min-h-[94px] w-desktop-icon cursor-pointer appearance-none justify-items-center gap-1 rounded-[10px] border border-transparent bg-transparent text-center font-[inherit] text-os-ink hover:border-white/45 hover:bg-white/20 focus-visible:border-white/45 focus-visible:bg-white/20 focus-visible:outline-none max-[720px]:w-[74px]'
const desktopIconTileClass =
  'grid size-desktop-tile place-items-center rounded-icon border border-white/50 bg-[image:var(--desktop-tile-bg)] text-os-ink shadow-desktop-tile max-[720px]:size-12 max-[720px]:rounded-[14px]'
const windowBaseClass =
  'absolute top-0 left-0 z-10 flex w-[min(720px,calc(100vw_-_1.5rem))] max-h-[min(640px,calc(100svh_-_7.25rem))] origin-center flex-col overflow-hidden rounded-window border border-os-border-strong bg-os-panel shadow-window backdrop-blur-[22px] will-change-[transform,opacity,filter,width,height] max-[720px]:w-[calc(100vw_-_1rem)] max-[720px]:max-h-[calc(100svh_-_8.4rem)]'
const maximizedWindowClass =
  'max-h-none rounded-none border-x-0 border-t-0'
const titlebarClass =
  'grid min-h-titlebar cursor-grab select-none grid-cols-[104px_1fr_78px] items-center border-b border-os-border bg-[image:var(--os-titlebar-bg)] px-3 active:cursor-grabbing max-[720px]:grid-cols-[74px_1fr_44px]'
const trafficClass =
  'relative grid h-[0.82rem] w-[0.82rem] cursor-pointer appearance-none place-items-center rounded-full border border-os-border font-[inherit] text-os-ink-soft before:absolute before:scale-50 before:opacity-0 before:transition before:content-[""] after:absolute after:scale-50 after:opacity-0 after:transition after:content-[""] group-hover/titlebar:before:scale-100 group-hover/titlebar:before:opacity-100 group-hover/titlebar:after:scale-100 group-hover/titlebar:after:opacity-100 focus-visible:before:scale-100 focus-visible:before:opacity-100 focus-visible:after:scale-100 focus-visible:after:opacity-100'
const dockButtonClass =
  'group relative grid size-dock-icon cursor-pointer appearance-none place-items-center rounded-[14px] border border-os-border bg-white/60 font-[inherit] text-ink transition hover:-translate-y-1 hover:outline-none focus-visible:-translate-y-1 focus-visible:outline-none max-[720px]:size-12'

const desktopStorageKey = 'felixos.desktop.settings'

const wallpaperOptions = [
  {
    id: 'lagoon',
    name: 'Lagoon',
    shell:
      'radial-gradient(circle at 16% 18%, rgba(246, 200, 95, 0.55), transparent 22%), radial-gradient(circle at 84% 12%, rgba(96, 215, 207, 0.42), transparent 26%), linear-gradient(135deg, #cbded8 0%, #ecf4ec 46%, #a9d4cd 100%)',
    wallpaper:
      'linear-gradient(115deg, transparent 0 48%, rgba(20, 38, 45, 0.08) 48.2% 48.7%, transparent 49%), linear-gradient(28deg, transparent 0 52%, rgba(255, 255, 255, 0.38) 52.2% 52.6%, transparent 53%), radial-gradient(900px 520px at 50% 78%, rgba(47, 106, 74, 0.28), transparent 62%)',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    shell:
      'radial-gradient(circle at 18% 18%, rgba(94, 211, 199, 0.28), transparent 25%), radial-gradient(circle at 84% 16%, rgba(231, 240, 232, 0.18), transparent 24%), linear-gradient(135deg, #102428 0%, #21383b 48%, #071416 100%)',
    wallpaper:
      'linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 18px), radial-gradient(900px 520px at 62% 72%, rgba(96, 215, 207, 0.2), transparent 64%)',
  },
  {
    id: 'field-notes',
    name: 'Field Notes',
    shell:
      'radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.58), transparent 25%), radial-gradient(circle at 86% 18%, rgba(47, 106, 74, 0.24), transparent 25%), linear-gradient(135deg, #dfead4 0%, #f8fbef 48%, #a9c8a7 100%)',
    wallpaper:
      'linear-gradient(120deg, transparent 0 44%, rgba(47,106,74,0.12) 44.2% 45%, transparent 45.2%), radial-gradient(900px 520px at 44% 82%, rgba(246, 200, 95, 0.22), transparent 62%)',
  },
  {
    id: 'portrait',
    name: 'Portrait',
    shell:
      'linear-gradient(rgba(236,244,236,0.76), rgba(169,212,205,0.76)), url("/felix-portrait.jpg") center 30% / cover no-repeat',
    wallpaper:
      'radial-gradient(860px 520px at 50% 82%, rgba(20, 38, 45, 0.24), transparent 64%), linear-gradient(115deg, transparent 0 50%, rgba(255, 255, 255, 0.28) 50.2% 50.7%, transparent 51%)',
  },
] as const

const screensaverOptions = [
  {
    id: 'dvd',
    name: 'DVD Logo',
    description: 'Classic corner-hunting bounce',
  },
] as const

type WallpaperId = (typeof wallpaperOptions)[number]['id']
type ScreensaverId = (typeof screensaverOptions)[number]['id']
type ScreensaverMode = 'idle' | 'preview'

type DesktopSettings = {
  screensaverMinutes: number
  screensaver: ScreensaverId
  wallpaper: WallpaperId
}

const defaultDesktopSettings: DesktopSettings = {
  screensaverMinutes: 5,
  screensaver: 'dvd',
  wallpaper: 'lagoon',
}

function parseDesktopSettings(value: string | null): DesktopSettings {
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
      screensaverMinutes,
      screensaver,
      wallpaper,
    }
  } catch {
    return defaultDesktopSettings
  }
}

function isWallpaperId(value: unknown): value is WallpaperId {
  return wallpaperOptions.some((option) => option.id === value)
}

function isScreensaverId(value: unknown): value is ScreensaverId {
  return screensaverOptions.some((option) => option.id === value)
}

type DesktopProps = {
  initialGithubData?: GithubData | null
  routeApp: RouteApp
}

export function Desktop({ initialGithubData = null, routeApp }: DesktopProps) {
  const {
    closeWindow,
    focusedWindow,
    focusWindow,
    minimizeWindow,
    moveWindow,
    openApp,
    startDrag,
    stopDrag,
    toggleMaximizeWindow,
    windowExit,
    windows,
  } = useDesktopWindows(routeApp)
  const [githubData, setGithubData] = useState<GithubData | null>(initialGithubData)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [issuesData, setIssuesData] = useState<IssuesBoardData | null>(null)
  const [issuesError, setIssuesError] = useState<string | null>(null)
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [stravaResult, setStravaResult] = useState<StravaDataResult | null>(null)
  const [stravaError, setStravaError] = useState<string | null>(null)
  const [stravaLoading, setStravaLoading] = useState(false)
  const [notesMarkdown, setNotesMarkdown] = useState<NotesMarkdownByDocument>(() => ({
    ...initialNotesMarkdown,
  }))
  const [commandOpen, setCommandOpen] = useState(false)
  const [screensaverMode, setScreensaverMode] = useState<ScreensaverMode | null>(null)
  const [desktopSettings, setDesktopSettings] = useState<DesktopSettings>(defaultDesktopSettings)
  const stravaRequestAttempted = useRef(false)
  const editorDocumentRef = useRef<HTMLElement | null>(null)
  const activeWallpaper =
    wallpaperOptions.find((option) => option.id === desktopSettings.wallpaper) ?? wallpaperOptions[0]

  useEffect(() => {
    const toggleCommand = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) return

      event.preventDefault()
      setCommandOpen((current) => !current)
    }

    window.addEventListener('keydown', toggleCommand)
    return () => window.removeEventListener('keydown', toggleCommand)
  }, [])

  useEffect(() => {
    setDesktopSettings(parseDesktopSettings(window.localStorage.getItem(desktopStorageKey)))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(desktopStorageKey, JSON.stringify(desktopSettings))
  }, [desktopSettings])

  useEffect(() => {
    if (screensaverMode === 'preview') return

    let timeoutId = window.setTimeout(
      () => setScreensaverMode('idle'),
      desktopSettings.screensaverMinutes * 60 * 1000,
    )

    const resetTimer = () => {
      if (screensaverMode === 'idle') {
        setScreensaverMode(null)
      }

      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(
        () => setScreensaverMode('idle'),
        desktopSettings.screensaverMinutes * 60 * 1000,
      )
    }

    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }))

    return () => {
      window.clearTimeout(timeoutId)
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer))
    }
  }, [desktopSettings.screensaverMinutes, screensaverMode])

  useEffect(() => {
    if (initialGithubData) {
      setGithubData(initialGithubData)
      setGithubError(null)
    }
  }, [initialGithubData])

  useEffect(() => {
    const githubIsVisible = windows.some((window) => window.app === 'github' && !window.minimized)

    if (!githubIsVisible || githubData || githubLoading) return

    setGithubError(null)
    setGithubLoading(true)
    getGithubData()
      .then((data) => {
        setGithubData(data)
      })
      .catch((error: unknown) => {
        setGithubError(error instanceof Error ? error.message : 'Unable to load GitHub data')
      })
      .finally(() => {
        setGithubLoading(false)
      })
  }, [githubData, githubLoading, windows])

  useEffect(() => {
    const stravaIsVisible = windows.some((window) => window.app === 'strava' && !window.minimized)

    if (!stravaIsVisible || stravaResult || stravaLoading || stravaRequestAttempted.current) return

    stravaRequestAttempted.current = true
    setStravaError(null)
    setStravaLoading(true)
    getStravaData()
      .then((result) => {
        setStravaResult(result)
      })
      .catch((error: unknown) => {
        setStravaError(error instanceof Error ? error.message : 'Unable to load Strava data')
      })
      .finally(() => {
        setStravaLoading(false)
      })
  }, [stravaLoading, stravaResult, windows])

  useEffect(() => {
    const issuesIsVisible = windows.some((window) => window.app === 'issues' && !window.minimized)

    if (!issuesIsVisible || issuesData || issuesLoading) return

    setIssuesError(null)
    setIssuesLoading(true)
    getIssuesBoardData()
      .then((data) => {
        setIssuesData(data)
      })
      .catch((error: unknown) => {
        setIssuesError(error instanceof Error ? error.message : 'Unable to load GitHub issues')
      })
      .finally(() => {
        setIssuesLoading(false)
      })
  }, [issuesData, issuesLoading, windows])

  const openHome = () => {
    openApp('notes', 'home')
  }

  const openGithub = () => {
    openApp('github')
  }

  const openBrowser = () => {
    openApp('browser')
  }

  const openHelp = () => {
    openApp('help')
  }

  const openIssues = () => {
    openApp('issues')
  }

  const openSettings = () => {
    openApp('settings')
  }

  const openSkills = () => {
    openApp('skills')
  }

  const openStrava = () => {
    openApp('strava')
  }

  const openTerminal = () => {
    openApp('terminal')
  }

  const openCommandTarget = (app: AppId, document?: NotesDocumentId) => {
    openApp(app, document)
    setCommandOpen(false)
  }

  const refreshGithub = useCallback(() => {
    setGithubData(null)
    setGithubError(null)
  }, [])

  const refreshIssues = useCallback(() => {
    setIssuesData(null)
    setIssuesError(null)
  }, [])

  const addCreatedIssue = useCallback((issue: ProjectIssue) => {
    setIssuesData((current) =>
      current
        ? {
            ...current,
            issues: [issue, ...current.issues.filter((existing) => existing.number !== issue.number)],
          }
        : current,
    )
  }, [])

  const refreshStrava = useCallback(() => {
    stravaRequestAttempted.current = false
    setStravaResult(null)
    setStravaError(null)
  }, [])

  const updateNotesMarkdown = useCallback(
    (document: NotesDocumentId, markdown: string) => {
      setNotesMarkdown((current) =>
        current[document] === markdown
          ? current
          : {
              ...current,
              [document]: markdown,
            },
      )
    },
    [],
  )

  const resetNotesDocument = useCallback((document: NotesDocumentId) => {
    setNotesMarkdown((current) =>
      current[document] === initialNotesMarkdown[document]
        ? current
        : {
            ...current,
            [document]: initialNotesMarkdown[document],
          },
    )
  }, [])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <main
          className="relative min-h-[100svh] overflow-hidden bg-[image:var(--os-shell-bg)] text-os-ink"
          style={
            {
              '--os-shell-bg': activeWallpaper.shell,
              '--os-wallpaper-bg': activeWallpaper.wallpaper,
            } as CSSProperties
          }
        >
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--os-wallpaper-bg)] opacity-90 after:absolute after:inset-0 after:bg-[image:var(--os-grid-bg)] after:bg-[length:42px_42px] after:opacity-15 after:[mask-image:linear-gradient(180deg,black,transparent_86%)] after:content-['']" />
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
          <button type="button" className={menuButtonClass} onClick={openHome}>
            File
          </button>
          <button type="button" className={menuButtonClass}>
            View
          </button>
          <button type="button" className={menuButtonClass} onClick={openHelp}>
            Help
          </button>
        </div>
        <button
          type="button"
          className="flex min-h-7 w-full min-w-0 cursor-pointer appearance-none items-center justify-center gap-2 justify-self-center rounded-full border border-os-border bg-white/55 px-3 text-meta font-bold text-os-ink-soft transition hover:border-os-border-strong hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoon/35 max-[640px]:hidden"
          onClick={() => setCommandOpen(true)}
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

      <DesktopShortcuts
        onOpenTarget={openCommandTarget}
      />

      <AnimatePresence>
        {commandOpen ? (
          <CommandPalette
            onClose={() => setCommandOpen(false)}
            onOpenTarget={openCommandTarget}
          />
        ) : null}
        {windows
          .filter((window) => !window.minimized)
          .map((window) => (
            <DesktopWindow
              key={`${windowKey(window)}-window`}
              active={focusedWindow === windowKey(window)}
              closeWindow={closeWindow}
              desktopSettings={desktopSettings}
              focusWindow={focusWindow}
              githubData={githubData}
              githubError={githubError}
              githubLoading={githubLoading}
              issuesData={issuesData}
              issuesError={issuesError}
              issuesLoading={issuesLoading}
              minimizeWindow={minimizeWindow}
              moveWindow={moveWindow}
              onGithubRefresh={refreshGithub}
              onIssueCreated={addCreatedIssue}
              onIssuesRefresh={refreshIssues}
              onPreviewScreensaver={() => setScreensaverMode('preview')}
              notesMarkdown={notesMarkdown}
              onOpenApp={openApp}
              onResetNotesDocument={resetNotesDocument}
              onScreensaverMinutesChange={(minutes) =>
                setDesktopSettings((current) => ({
                  ...current,
                  screensaverMinutes: minutes,
                }))
              }
              onStravaRefresh={refreshStrava}
              onUpdateNotesMarkdown={updateNotesMarkdown}
              onWallpaperChange={(wallpaper) =>
                setDesktopSettings((current) => ({
                  ...current,
                  wallpaper: isWallpaperId(wallpaper) ? wallpaper : current.wallpaper,
                }))
              }
              startDrag={startDrag}
              stopDrag={stopDrag}
              stravaError={stravaError}
              stravaLoading={stravaLoading}
              stravaResult={stravaResult}
              toggleMaximizeWindow={toggleMaximizeWindow}
              window={window}
              windowExit={windowExit}
              editorDocumentRef={editorDocumentRef}
            />
          ))}
      </AnimatePresence>

      <Dock
        openBrowser={openBrowser}
        openGithub={openGithub}
        openHome={openHome}
        openIssues={openIssues}
        openSkills={openSkills}
        openStrava={openStrava}
        openTerminal={openTerminal}
        windows={windows}
      />
          <AnimatePresence>
            {screensaverMode ? (
              <ScreensaverOverlay
                mode={screensaverMode}
                onClose={() => setScreensaverMode(null)}
              />
            ) : null}
          </AnimatePresence>
        </main>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={openSettings}>
          <MonitorCog aria-hidden="true" size={16} />
          Desktop Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function ScreensaverOverlay({
  mode,
  onClose,
}: {
  mode: ScreensaverMode
  onClose: () => void
}) {
  const logoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return

    const colors = ['#ff5b5f', '#2d7dff', '#22d05f', '#f0d326', '#b45cff', '#ffffff']
    let colorIndex = 0
    let animationFrame = 0
    let lastTime = performance.now()
    let x = Math.min(96, window.innerWidth * 0.16)
    let y = Math.min(80, window.innerHeight * 0.18)
    let vx = 185
    let vy = 135

    logo.style.color = colors[colorIndex]

    const changeColor = () => {
      colorIndex = (colorIndex + 1) % colors.length
      logo.style.color = colors[colorIndex]
    }

    const tick = (time: number) => {
      const elapsedSeconds = Math.min(0.035, (time - lastTime) / 1000)
      lastTime = time

      const { height, width } = logo.getBoundingClientRect()
      const maxX = Math.max(0, window.innerWidth - width)
      const maxY = Math.max(0, window.innerHeight - height)
      let hitEdge = false

      x += vx * elapsedSeconds
      y += vy * elapsedSeconds

      if (x <= 0) {
        x = 0
        vx = Math.abs(vx)
        hitEdge = true
      } else if (x >= maxX) {
        x = maxX
        vx = -Math.abs(vx)
        hitEdge = true
      }

      if (y <= 0) {
        y = 0
        vy = Math.abs(vy)
        hitEdge = true
      } else if (y >= maxY) {
        y = maxY
        vy = -Math.abs(vy)
        hitEdge = true
      }

      if (hitEdge) changeColor()

      logo.style.transform = `translate3d(${x}px, ${y}px, 0)`
      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[2147483646] overflow-hidden bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onPointerDown={mode === 'idle' ? onClose : undefined}
      role="dialog"
      aria-label={mode === 'preview' ? 'Screensaver preview' : 'Screensaver'}
    >
      <div
        ref={logoRef}
        className="absolute left-0 top-0 h-[clamp(5rem,17vw,11rem)] w-[clamp(11rem,36vw,24rem)] will-change-transform"
        aria-hidden="true"
      >
        <svg
          className="h-full w-full overflow-visible drop-shadow-[0_0_18px_currentColor]"
          viewBox="0 0 744.09448 347.24408"
          role="img"
          aria-label="DVD logo"
        >
          <g transform="translate(-31.383578,-416.39712)">
            <g transform="translate(36.559368,120.22576)" fill="currentColor">
              <path d="M 461.65349,313.82833 C 461.65349,313.82833 423.33901,359.30605 416.17584,367.88512 C 377.94459,413.94585 371.11467,426.27316 370.03182,429.52157 C 370.19841,426.27316 368.78245,413.77925 352.45714,367.21882 C 348.12595,354.80821 334.13279,313.82833 334.13279,313.82833 L 73.510824,313.82833 L 64.348614,352.47606 L 132.81498,352.55936 L 148.89047,352.55936 C 192.95217,352.55936 219.77229,370.21734 212.35929,401.70189 C 204.19664,435.93508 165.71549,450.84443 124.81891,450.84443 L 109.49315,450.84443 L 129.40005,366.80234 L 60.933614,366.80234 L 31.781284,489.49209 L 128.98357,489.49209 C 201.94772,489.49209 271.41363,450.92773 283.57429,401.70189 C 285.82321,392.62298 285.57332,370.05075 279.9927,356.55736 C 279.90941,356.05765 279.74288,355.64117 279.24311,354.55839 C 278.99322,354.14191 278.82663,352.14288 279.9927,351.7264 C 280.65907,351.47651 281.82514,352.72595 281.99174,353.05906 C 282.49151,354.55839 282.99129,355.72446 282.99129,355.72446 L 344.79425,530.13879 L 502.13359,352.55936 L 568.76759,352.55936 L 584.84301,352.55936 C 628.82141,352.55936 655.97471,370.21734 648.47842,401.70189 C 640.31577,435.93508 601.66804,450.84443 560.77145,450.84443 L 545.36239,450.84443 L 565.35259,366.80234 L 496.88622,366.80234 L 467.73382,489.49209 L 564.85282,489.49209 C 637.90025,489.49209 707.78258,451.09425 719.52683,401.70189 C 731.27107,352.30947 679.96291,313.82833 606.58229,313.82833 L 461.65349,313.82833" />
              <path d="M 347.2097,530.88845 C 162.38379,530.88845 12.540744,552.12802 12.540744,578.36507 C 12.540744,604.51889 162.38379,625.75846 347.2097,625.75846 C 532.03559,625.75846 681.87865,604.51889 681.87865,578.36507 C 681.87865,552.12802 532.03559,530.88845 347.2097,530.88845 z M 335.13234,595.10686 C 292.90302,595.10686 258.66984,588.02705 258.66984,579.28132 C 258.66984,570.5356 292.90302,563.45578 335.13234,563.45578 C 377.27829,563.45578 411.51147,570.5356 411.51147,579.28132 C 411.51147,588.02705 377.27829,595.10686 335.13234,595.10686" />
            </g>
          </g>
        </svg>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 text-caption font-black uppercase tracking-[0.12em] text-white/62">
        <span>DVD Screensaver</span>
        {mode === 'preview' ? (
          <button
            type="button"
            className="rounded-control border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={onClose}
          >
            Exit Preview
          </button>
        ) : (
          <span>Click or press any key</span>
        )}
      </div>
    </motion.div>
  )
}

function DesktopShortcuts({
  onOpenTarget,
}: {
  onOpenTarget: (app: AppId, document?: NotesDocumentId) => void
}) {
  return (
    <section
      className="relative z-[2] grid w-max grid-cols-[repeat(2,86px)] gap-4 p-5 max-[720px]:grid-cols-[repeat(4,74px)] max-[720px]:gap-2 max-[720px]:px-2 max-[720px]:py-3.5"
      aria-label="Desktop shortcuts"
    >
      {desktopApps.map((app) => {
        const Icon = app.icon

        return (
          <button
            key={app.id}
            type="button"
            className={desktopIconClass}
            onClick={() => onOpenTarget(app.target.app, app.target.document)}
            aria-label={`Open ${app.title}`}
          >
            <span
              className={desktopIconTileClass}
              style={{ '--accent': app.accent } as CSSProperties}
            >
              <Icon aria-hidden="true" size={28} />
            </span>
            <span className="max-w-[82px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.76rem] font-black leading-tight text-os-ink">
              {app.title}
            </span>
            <small className="text-[0.64rem] font-extrabold text-os-ink-soft">
              {app.subtitle}
            </small>
          </button>
        )
      })}
    </section>
  )
}

type DesktopWindowProps = {
  active: boolean
  closeWindow: (window: WindowState) => void
  desktopSettings: DesktopSettings
  editorDocumentRef: RefObject<HTMLElement | null>
  focusWindow: (window: WindowState) => void
  githubData: GithubData | null
  githubError: string | null
  githubLoading: boolean
  issuesData: IssuesBoardData | null
  issuesError: string | null
  issuesLoading: boolean
  minimizeWindow: (window: WindowState) => void
  moveWindow: (event: PointerEvent<HTMLDivElement>) => void
  notesMarkdown: NotesMarkdownByDocument
  onGithubRefresh: () => void
  onIssueCreated: (issue: ProjectIssue) => void
  onIssuesRefresh: () => void
  onOpenApp: (app: AppId, document?: NotesDocumentId) => void
  onPreviewScreensaver: () => void
  onResetNotesDocument: (document: NotesDocumentId) => void
  onScreensaverMinutesChange: (minutes: number) => void
  onStravaRefresh: () => void
  onUpdateNotesMarkdown: (document: NotesDocumentId, markdown: string) => void
  onWallpaperChange: (wallpaper: string) => void
  startDrag: (event: PointerEvent<HTMLDivElement>, window: WindowState) => void
  stopDrag: (event: PointerEvent<HTMLDivElement>) => void
  stravaError: string | null
  stravaLoading: boolean
  stravaResult: StravaDataResult | null
  toggleMaximizeWindow: (window: WindowState) => void
  window: WindowState
  windowExit: 'close' | 'minimize'
}

function DesktopWindow({
  active,
  closeWindow,
  desktopSettings,
  editorDocumentRef,
  focusWindow,
  githubData,
  githubError,
  githubLoading,
  issuesData,
  issuesError,
  issuesLoading,
  minimizeWindow,
  moveWindow,
  notesMarkdown,
  onGithubRefresh,
  onIssueCreated,
  onIssuesRefresh,
  onOpenApp,
  onPreviewScreensaver,
  onResetNotesDocument,
  onScreensaverMinutesChange,
  onStravaRefresh,
  onUpdateNotesMarkdown,
  onWallpaperChange,
  startDrag,
  stopDrag,
  stravaError,
  stravaLoading,
  stravaResult,
  toggleMaximizeWindow,
  window,
  windowExit,
}: DesktopWindowProps) {
  const activeAppTitle =
    window.app === 'browser'
      ? 'browser.app'
      : window.app === 'github'
      ? 'github.app'
      : window.app === 'help'
        ? 'help.app'
        : window.app === 'issues'
          ? 'issues.app'
          : window.app === 'settings'
            ? 'settings.app'
            : window.app === 'skills'
              ? 'skills.app'
              : window.app === 'strava'
                ? 'strava.app'
                : window.app === 'terminal'
                  ? 'terminal.app'
                  : 'notes.app'
  const ActiveAppIcon =
    window.app === 'browser'
      ? Globe2
      : window.app === 'github'
      ? Github
      : window.app === 'help'
        ? CircleHelp
        : window.app === 'issues'
          ? CircleDot
          : window.app === 'settings'
            ? MonitorCog
            : window.app === 'skills'
              ? Gauge
              : window.app === 'strava'
                ? Activity
                : window.app === 'terminal'
                  ? Terminal
                  : FileText

  return (
    <motion.section
      layout
      className={`${windowBaseClass} ${window.maximized ? 'os-window--maximized' : ''} ${
        window.app === 'github'
          ? 'bg-[rgba(246,248,250,0.94)]'
          : window.app === 'browser'
            ? 'bg-[rgba(248,249,255,0.94)]'
            : window.app === 'help'
              ? 'bg-[rgba(250,252,247,0.94)]'
            : window.app === 'issues'
              ? 'bg-[rgba(248,249,255,0.94)]'
              : window.app === 'settings'
                ? 'bg-[rgba(250,252,247,0.94)]'
                : window.app === 'skills'
                  ? 'bg-[rgba(247,252,249,0.94)]'
                  : window.app === 'strava'
                    ? 'border-strava/45 bg-strava-bg'
                    : window.app === 'terminal'
                      ? 'border-[#17383b] bg-[#071416]'
                      : ''
      } ${window.maximized ? maximizedWindowClass : ''}`}
      style={{ zIndex: window.z }}
      initial={{
        x: window.x + 38,
        y: window.y + 28,
        opacity: 0,
        scale: 0.92,
        filter: 'blur(10px)',
      }}
      animate={{
        ...windowAnimationFor(window),
        filter: 'blur(0px)',
      }}
      exit={windowExitAnimation(window, windowExit)}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 36,
        mass: 0.9,
      }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('a,button')) return
        if (!active) focusWindow(window)
      }}
      onContextMenu={(event) => event.stopPropagation()}
      aria-label={`${activeAppTitle} window`}
    >
      <div
        className={`${titlebarClass} group/titlebar`}
        onPointerDown={(event) => startDrag(event, window)}
        onPointerMove={moveWindow}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => toggleMaximizeWindow(window)}
      >
        <div className="flex gap-2">
          <TrafficButton
            className="bg-[#ff6b5f] before:h-[1.5px] before:w-[0.45rem] before:rotate-45 before:rounded-full before:bg-current after:h-[1.5px] after:w-[0.45rem] after:-rotate-45 after:rounded-full after:bg-current"
            label={`Close ${activeAppTitle}`}
            onClick={() => closeWindow(window)}
          />
          <TrafficButton
            className="bg-[#f6c85f] before:h-[1.6px] before:w-[0.48rem] before:rounded-full before:bg-current"
            label={`Minimize ${activeAppTitle}`}
            onClick={() => minimizeWindow(window)}
          />
          <TrafficButton
            className="bg-[#69c779] before:h-[0.38rem] before:w-[0.38rem] before:rounded-[2px] before:border-[1.5px] before:border-current"
            label={window.maximized ? `Restore ${activeAppTitle}` : `Maximize ${activeAppTitle}`}
            onClick={() => toggleMaximizeWindow(window)}
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-window font-black text-os-ink-muted">
          <ActiveAppIcon aria-hidden="true" size={16} />
          <span>{activeAppTitle}</span>
        </div>
        <span className="justify-self-end text-caption font-black text-os-ink-soft max-[720px]:hidden">
          saved
        </span>
      </div>

      {window.app === 'browser' ? <BrowserApp initialUrl={window.url} /> : null}
      {window.app === 'notes' ? (
        <NotesApp
          document={window.document ?? 'home'}
          documentRef={editorDocumentRef}
          markdown={notesMarkdown[window.document ?? 'home']}
          onMarkdownChange={onUpdateNotesMarkdown}
          onResetDocument={onResetNotesDocument}
        />
      ) : null}
      {window.app === 'skills' ? <SkillsApp /> : null}
      {window.app === 'github' ? (
        <GithubApp
          data={githubData}
          error={githubError}
          loading={githubLoading}
          onRefresh={onGithubRefresh}
        />
      ) : null}
      {window.app === 'help' ? <HelpApp /> : null}
      {window.app === 'settings' ? (
        <SettingsApp
          screensaverMinutes={desktopSettings.screensaverMinutes}
          selectedWallpaper={desktopSettings.wallpaper}
          wallpaperOptions={wallpaperOptions}
          onPreviewScreensaver={onPreviewScreensaver}
          onScreensaverMinutesChange={onScreensaverMinutesChange}
          onWallpaperChange={onWallpaperChange}
        />
      ) : null}
      {window.app === 'issues' ? (
        <IssuesApp
          data={issuesData}
          error={issuesError}
          loading={issuesLoading}
          onIssueCreated={onIssueCreated}
          onRefresh={onIssuesRefresh}
        />
      ) : null}
      {window.app === 'strava' ? (
        <StravaApp
          error={stravaError}
          loading={stravaLoading}
          onRefresh={onStravaRefresh}
          result={stravaResult}
        />
      ) : null}
      {window.app === 'terminal' ? <TerminalApp onOpenApp={onOpenApp} /> : null}
    </motion.section>
  )
}

function TrafficButton({
  className,
  label,
  onClick,
}: {
  className: string
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      className={`${trafficClass} ${className}`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      aria-label={label}
    />
  )
}

function Dock({
  openBrowser,
  openGithub,
  openHome,
  openIssues,
  openSkills,
  openStrava,
  openTerminal,
  windows,
}: {
  openBrowser: () => void
  openGithub: () => void
  openHome: () => void
  openIssues: () => void
  openSkills: () => void
  openStrava: () => void
  openTerminal: () => void
  windows: WindowState[]
}) {
  return (
    <nav
      className="absolute bottom-4 left-1/2 z-[2147483000] flex max-w-[calc(100%_-_1rem)] -translate-x-1/2 gap-1.5 rounded-dock border border-white/45 bg-os-dock p-2 shadow-dock backdrop-blur-[22px]"
      aria-label="Application dock"
      onContextMenu={(event) => event.stopPropagation()}
    >
      {dockApps.map((app) => {
        const Icon = app.icon
        const isBrowser = app.id === 'browser'
        const isNotes = app.id === 'notes'
        const isGithub = app.id === 'github'
        const isIssues = app.id === 'issues'
        const isSkills = app.id === 'skills'
        const isStrava = app.id === 'strava'
        const isTerminal = app.id === 'terminal'
        const isRunning = windows.some((window) => window.app === app.id)

        return (
          <button
            key={app.id}
            type="button"
            className={`${dockButtonClass} ${
              isRunning
                ? 'after:absolute after:bottom-1 after:h-[0.32rem] after:w-[0.32rem] after:rounded-full after:bg-[#328f97] after:content-[""]'
                : ''
            }`}
            onClick={
              isNotes
                ? openHome
                : isBrowser
                  ? openBrowser
                  : isGithub
                    ? openGithub
                    : isIssues
                      ? openIssues
                      : isSkills
                        ? openSkills
                        : isStrava
                          ? openStrava
                          : isTerminal
                            ? openTerminal
                            : undefined
            }
            aria-label={
              isNotes
                ? 'Open notes'
                : isBrowser
                  ? 'Open Browser'
                  : isGithub
                    ? 'Open GitHub'
                    : isIssues
                      ? 'Open Issues'
                      : isSkills
                        ? 'Open Skills'
                        : isStrava
                          ? 'Open Strava'
                          : isTerminal
                            ? 'Open Terminal'
                            : 'Open app'
            }
          >
            <Icon aria-hidden="true" size={24} />
            <span className="pointer-events-none absolute bottom-[calc(100%_+_0.48rem)] translate-y-[3px] whitespace-nowrap rounded-control bg-os-tooltip px-1.5 py-1 text-[0.68rem] font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {app.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function windowAnimationFor(window: WindowState) {
  return window.maximized
    ? {
        x: 0,
        y: 42,
        width: '100vw',
        height: 'calc(100svh - 130px)',
        scale: 1,
        opacity: 1,
      }
    : {
        x: window.x,
        y: window.y,
        width:
          window.app === 'browser' ||
          window.app === 'github' ||
          window.app === 'skills' ||
          window.app === 'strava'
            ? 'min(920px, calc(100vw - 1.5rem))'
            : window.app === 'help' || window.app === 'settings'
              ? 'min(680px, calc(100vw - 1.5rem))'
              : window.app === 'issues'
                ? 'min(980px, calc(100vw - 1.5rem))'
                : window.app === 'terminal'
                  ? 'min(760px, calc(100vw - 1.5rem))'
                  : 'min(720px, calc(100vw - 1.5rem))',
        height: 'auto',
        scale: 1,
        opacity: 1,
      }
}

function windowExitAnimation(window: WindowState, windowExit: 'close' | 'minimize') {
  const exitEase = [0.22, 1, 0.36, 1] as const
  const closeEase = [0.4, 0, 0.2, 1] as const

  return windowExit === 'minimize'
    ? {
        x: 'calc(50vw - 120px)',
        y: 'calc(100vh - 86px)',
        opacity: 0,
        scale: 0.22,
        filter: 'blur(12px)',
        transition: { duration: 0.26, ease: exitEase },
      }
    : {
        opacity: 0,
        scale: 0.88,
        y: window.y + 16,
        filter: 'blur(12px)',
        transition: { duration: 0.2, ease: closeEase },
      }
}
