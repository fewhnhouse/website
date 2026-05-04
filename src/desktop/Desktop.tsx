import { Activity, Battery, FileText, Github, Search, Wifi } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, RefObject } from 'react'

import { GithubApp } from '@/apps/github/GithubApp'
import { getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { HomeEditor } from '@/apps/home/HomeEditor'
import { StravaApp } from '@/apps/strava/StravaApp'
import { getStravaData, type StravaDataResult } from '@/apps/strava/stravaData'

import { desktopApps, dockApps } from './apps'
import type { RouteApp, WindowState } from './types'
import { useDesktopWindows } from './useDesktopWindows'

const menuButtonClass =
  'cursor-pointer appearance-none border-0 bg-transparent font-[inherit] text-window font-extrabold text-os-ink-muted max-[720px]:hidden'
const desktopIconClass =
  'grid min-h-[94px] w-desktop-icon cursor-pointer appearance-none justify-items-center gap-1 rounded-[10px] border border-transparent bg-transparent text-center font-[inherit] text-os-ink hover:border-white/45 hover:bg-white/20 focus-visible:border-white/45 focus-visible:bg-white/20 focus-visible:outline-none max-[720px]:w-[74px]'
const desktopIconTileClass =
  'grid size-desktop-tile place-items-center rounded-icon border border-white/50 bg-[image:var(--desktop-tile-bg)] text-os-ink shadow-desktop-tile max-[720px]:size-12 max-[720px]:rounded-[14px]'
const windowBaseClass =
  'absolute top-0 left-0 z-10 flex w-[min(720px,calc(100vw_-_1.5rem))] max-h-[min(640px,calc(100svh_-_7.25rem))] origin-center flex-col overflow-hidden rounded-window border border-os-border-strong bg-os-panel shadow-window backdrop-blur-[22px] will-change-[transform,opacity,filter,width,height] max-[720px]:w-[calc(100vw_-_1rem)] max-[720px]:max-h-[calc(100svh_-_8.4rem)]'
const maximizedWindowClass = 'max-h-[calc(100svh_-_132px)] rounded-[14px] max-[720px]:max-h-[calc(100svh_-_7rem)]'
const titlebarClass =
  'grid min-h-titlebar cursor-grab select-none grid-cols-[104px_1fr_78px] items-center border-b border-os-border bg-[image:var(--os-titlebar-bg)] px-3 active:cursor-grabbing max-[720px]:grid-cols-[74px_1fr_44px]'
const trafficClass =
  'relative grid h-[0.82rem] w-[0.82rem] cursor-pointer appearance-none place-items-center rounded-full border border-os-border font-[inherit] text-os-ink-soft before:absolute before:scale-50 before:opacity-0 before:transition before:content-[""] after:absolute after:scale-50 after:opacity-0 after:transition after:content-[""] group-hover/titlebar:before:scale-100 group-hover/titlebar:before:opacity-100 group-hover/titlebar:after:scale-100 group-hover/titlebar:after:opacity-100 focus-visible:before:scale-100 focus-visible:before:opacity-100 focus-visible:after:scale-100 focus-visible:after:opacity-100'
const dockButtonClass =
  'group relative grid size-dock-icon cursor-pointer appearance-none place-items-center rounded-[14px] border border-os-border bg-white/60 font-[inherit] text-ink transition hover:-translate-y-1 hover:outline-none focus-visible:-translate-y-1 focus-visible:outline-none max-[720px]:size-12'

type DesktopProps = {
  initialGithubData?: GithubData | null
  routeApp: RouteApp
}

export function Desktop({ initialGithubData = null, routeApp }: DesktopProps) {
  const {
    closeWindow,
    focusedApp,
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
  const [stravaResult, setStravaResult] = useState<StravaDataResult | null>(null)
  const [stravaError, setStravaError] = useState<string | null>(null)
  const [stravaLoading, setStravaLoading] = useState(false)
  const stravaRequestAttempted = useRef(false)
  const editorDocumentRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (initialGithubData) {
      setGithubData(initialGithubData)
      setGithubError(null)
    }
  }, [initialGithubData])

  useEffect(() => {
    if (focusedApp === 'home') {
      editorDocumentRef.current?.scrollTo({ top: 0 })
    }
  }, [focusedApp])

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

  const openHome = () => {
    openApp('home')
  }

  const openGithub = () => {
    openApp('github')
  }

  const openStrava = () => {
    openApp('strava')
  }

  const refreshGithub = useCallback(() => {
    setGithubData(null)
    setGithubError(null)
  }, [])

  const refreshStrava = useCallback(() => {
    stravaRequestAttempted.current = false
    setStravaResult(null)
    setStravaError(null)
  }, [])

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[image:var(--os-shell-bg)] text-os-ink">
      <div className="pointer-events-none absolute inset-0 bg-[image:var(--os-wallpaper-bg)] opacity-90 after:absolute after:inset-0 after:bg-[image:var(--os-grid-bg)] after:bg-[length:42px_42px] after:opacity-15 after:[mask-image:linear-gradient(180deg,black,transparent_86%)] after:content-['']" />
      <header className="relative z-[2147483000] grid h-titlebar grid-cols-[1fr_minmax(180px,340px)_1fr] items-center gap-4 border-b border-os-border bg-os-glass px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-[18px] max-[720px]:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-center gap-2">
          <img
            className="size-[1.55rem] rounded-full border border-white/80 object-cover object-[50%_31%] shadow-os-logo"
            src="/felix-portrait.jpg"
            alt="Felix Wohnhaas"
          />
          <strong>FelixOS</strong>
          <button type="button" className={menuButtonClass} onClick={openHome}>
            File
          </button>
          <button type="button" className={menuButtonClass}>
            View
          </button>
          <button type="button" className={menuButtonClass}>
            Help
          </button>
        </div>
        <div className="flex min-h-7 w-full items-center justify-center gap-2 justify-self-center rounded-full border border-os-border bg-white/55 text-meta font-bold text-os-ink-soft max-[720px]:hidden">
          <Search aria-hidden="true" size={15} />
          <span>Search Felix&apos;s computer</span>
        </div>
        <div className="flex items-center gap-2.5 justify-self-end text-window font-extrabold text-os-ink-muted">
          <Wifi aria-hidden="true" size={16} />
          <Battery aria-hidden="true" size={17} />
          <time dateTime="2026-05-04T13:30">13:30</time>
        </div>
      </header>

      <DesktopShortcuts openGithub={openGithub} openHome={openHome} openStrava={openStrava} />

      <AnimatePresence>
        {windows
          .filter((window) => !window.minimized)
          .map((window) => (
            <DesktopWindow
              key={`${window.app}-window`}
              closeWindow={closeWindow}
              focusWindow={focusWindow}
              focused={focusedApp === window.app}
              githubData={githubData}
              githubError={githubError}
              githubLoading={githubLoading}
              minimizeWindow={minimizeWindow}
              moveWindow={moveWindow}
              onGithubRefresh={refreshGithub}
              onStravaRefresh={refreshStrava}
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

      <Dock openGithub={openGithub} openHome={openHome} openStrava={openStrava} windows={windows} />
    </main>
  )
}

function DesktopShortcuts({
  openGithub,
  openHome,
  openStrava,
}: {
  openGithub: () => void
  openHome: () => void
  openStrava: () => void
}) {
  return (
    <section
      className="relative z-[2] grid w-max grid-cols-[repeat(2,86px)] gap-4 p-5 max-[720px]:grid-cols-[repeat(4,74px)] max-[720px]:gap-2 max-[720px]:px-2 max-[720px]:py-3.5"
      aria-label="Desktop shortcuts"
    >
      {desktopApps.map((app) => {
        const Icon = app.icon
        const isHome = app.id === 'home'
        const isGithub = app.id === 'github'
        const isStrava = app.id === 'strava'

        return (
          <button
            key={app.id}
            type="button"
            className={desktopIconClass}
            onClick={isHome ? openHome : isGithub ? openGithub : isStrava ? openStrava : undefined}
            aria-label={
              isHome
                ? 'Open home.mdx'
                : isGithub
                  ? 'Open GitHub'
                  : isStrava
                    ? 'Open Strava'
                    : `${app.title} coming soon`
            }
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
  closeWindow: (app: WindowState['app']) => void
  editorDocumentRef: RefObject<HTMLElement | null>
  focused: boolean
  focusWindow: (app: WindowState['app']) => void
  githubData: GithubData | null
  githubError: string | null
  githubLoading: boolean
  minimizeWindow: (app: WindowState['app']) => void
  moveWindow: (event: PointerEvent<HTMLDivElement>) => void
  onGithubRefresh: () => void
  onStravaRefresh: () => void
  startDrag: (event: PointerEvent<HTMLDivElement>, window: WindowState) => void
  stopDrag: (event: PointerEvent<HTMLDivElement>) => void
  stravaError: string | null
  stravaLoading: boolean
  stravaResult: StravaDataResult | null
  toggleMaximizeWindow: (app: WindowState['app']) => void
  window: WindowState
  windowExit: 'close' | 'minimize'
}

function DesktopWindow({
  closeWindow,
  editorDocumentRef,
  focused,
  focusWindow,
  githubData,
  githubError,
  githubLoading,
  minimizeWindow,
  moveWindow,
  onGithubRefresh,
  onStravaRefresh,
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
    window.app === 'github' ? 'github.app' : window.app === 'strava' ? 'strava.app' : 'home.mdx'
  const ActiveAppIcon = window.app === 'github' ? Github : window.app === 'strava' ? Activity : FileText

  return (
    <motion.section
      layout
      className={`${windowBaseClass} ${
        window.app === 'github'
          ? 'bg-[rgba(246,248,250,0.94)]'
          : window.app === 'strava'
            ? 'border-strava/45 bg-strava-bg'
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
        if (event.target instanceof Element && event.target.closest('a')) return
        if (!focused) focusWindow(window.app)
      }}
      aria-label={`${activeAppTitle} window`}
    >
      <div
        className={`${titlebarClass} group/titlebar`}
        onPointerDown={(event) => startDrag(event, window)}
        onPointerMove={moveWindow}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => toggleMaximizeWindow(window.app)}
      >
        <div className="flex gap-2">
          <TrafficButton
            className="bg-[#ff6b5f] before:h-[1.5px] before:w-[0.45rem] before:rotate-45 before:rounded-full before:bg-current after:h-[1.5px] after:w-[0.45rem] after:-rotate-45 after:rounded-full after:bg-current"
            label={`Close ${activeAppTitle}`}
            onClick={() => closeWindow(window.app)}
          />
          <TrafficButton
            className="bg-[#f6c85f] before:h-[1.6px] before:w-[0.48rem] before:rounded-full before:bg-current"
            label={`Minimize ${activeAppTitle}`}
            onClick={() => minimizeWindow(window.app)}
          />
          <TrafficButton
            className="bg-[#69c779] before:h-[0.38rem] before:w-[0.38rem] before:rounded-[2px] before:border-[1.5px] before:border-current"
            label={window.maximized ? `Restore ${activeAppTitle}` : `Maximize ${activeAppTitle}`}
            onClick={() => toggleMaximizeWindow(window.app)}
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

      {window.app === 'home' ? <HomeEditor documentRef={editorDocumentRef} /> : null}
      {window.app === 'github' ? (
        <GithubApp
          data={githubData}
          error={githubError}
          loading={githubLoading}
          onRefresh={onGithubRefresh}
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
  openGithub,
  openHome,
  openStrava,
  windows,
}: {
  openGithub: () => void
  openHome: () => void
  openStrava: () => void
  windows: WindowState[]
}) {
  return (
    <nav
      className="absolute bottom-4 left-1/2 z-[2147483000] flex max-w-[calc(100%_-_1rem)] -translate-x-1/2 gap-1.5 rounded-dock border border-white/45 bg-os-dock p-2 shadow-dock backdrop-blur-[22px]"
      aria-label="Application dock"
    >
      {dockApps.map((app) => {
        const Icon = app.icon
        const isEditor = app.id === 'home'
        const isGithub = app.id === 'github'
        const isStrava = app.id === 'strava'
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
            onClick={isEditor ? openHome : isGithub ? openGithub : isStrava ? openStrava : undefined}
            aria-label={
              isEditor
                ? 'Open editor'
                : isGithub
                  ? 'Open GitHub'
                  : isStrava
                    ? 'Open Strava'
                    : `${app.label} coming soon`
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
        x: 16,
        y: 58,
        width: 'calc(100vw - 32px)',
        height: 'calc(100svh - 132px)',
        scale: 1,
        opacity: 1,
      }
    : {
        x: window.x,
        y: window.y,
        width:
          window.app === 'github' || window.app === 'strava'
            ? 'min(920px, calc(100vw - 1.5rem))'
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
