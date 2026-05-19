import { MonitorCog } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { getIssuesBoardData } from '@/apps/issues/issuesData'
import type { IssuesBoardData, ProjectIssue } from '@/apps/issues/types'
import { initialNotesMarkdown, type NotesMarkdownByDocument } from '@/apps/notes/notesMarkdown'
import { getStravaData, type StravaDataResult } from '@/apps/strava/stravaData'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { CommandPalette } from './CommandPalette'
import {
  defaultDesktopSettings,
  desktopStorageKey,
  isWallpaperId,
  parseDesktopSettings,
  wallpaperOptions,
  type DesktopSettings,
  type ScreensaverMode,
} from './desktopSettings'
import { DesktopShortcuts } from './DesktopShortcuts'
import { DesktopTopBar } from './DesktopTopBar'
import { DesktopWindow } from './DesktopWindow'
import { Dock } from './Dock'
import { ScreensaverOverlay } from './ScreensaverOverlay'
import { windowKey, type AppId, type NotesDocumentId, type RouteApp } from './types'
import { useDesktopWindows } from './useDesktopWindows'

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
  const desktopSettingsHydrated = useRef(false)
  const stravaRequestAttempted = useRef(false)
  const editorDocumentRef = useRef<HTMLElement | null>(null)
  const activeWallpaper =
    wallpaperOptions.find((option) => option.id === desktopSettings.wallpaper) ?? wallpaperOptions[0]
  const visibleWindows = useMemo(
    () => windows.filter((window) => !window.minimized),
    [windows],
  )
  const githubIsVisible = useMemo(
    () => visibleWindows.some((window) => window.app === 'github'),
    [visibleWindows],
  )
  const issuesIsVisible = useMemo(
    () => visibleWindows.some((window) => window.app === 'issues'),
    [visibleWindows],
  )
  const stravaIsVisible = useMemo(
    () => visibleWindows.some((window) => window.app === 'strava'),
    [visibleWindows],
  )

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
    desktopSettingsHydrated.current = true
  }, [])

  useEffect(() => {
    if (!desktopSettingsHydrated.current) return

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
  }, [githubData, githubIsVisible, githubLoading])

  useEffect(() => {
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
  }, [stravaIsVisible, stravaLoading, stravaResult])

  useEffect(() => {
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
  }, [issuesData, issuesIsVisible, issuesLoading])

  const openHome = () => {
    openApp('notes', 'home')
  }

  const openGithub = () => {
    openApp('github')
  }

  const openGame = () => {
    openApp('game')
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
              '--desktop-icon-fg': activeWallpaper.desktopIcon,
              '--desktop-icon-muted': activeWallpaper.desktopIconSoft,
              '--desktop-tile-fg': activeWallpaper.desktopTileIcon,
              '--desktop-tile-bg': activeWallpaper.desktopTile,
            } as CSSProperties
          }
        >
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--os-wallpaper-bg)] opacity-90 after:absolute after:inset-0 after:bg-[image:var(--os-grid-bg)] after:bg-[length:42px_42px] after:opacity-15 after:[mask-image:linear-gradient(180deg,black,transparent_86%)] after:content-['']" />
      <DesktopTopBar
        commandOpen={commandOpen}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenHelp={openHelp}
        onOpenHome={openHome}
      />

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
        {visibleWindows.map((window) => (
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
        openGame={openGame}
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
