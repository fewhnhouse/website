import { Activity, Battery, FileText, Github, Search, Wifi } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
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

const osShellClass =
  'relative min-h-[100svh] overflow-hidden text-[#14262d] bg-[radial-gradient(circle_at_16%_18%,rgba(246,200,95,0.55),transparent_22%),radial-gradient(circle_at_84%_12%,rgba(96,215,207,0.42),transparent_26%),linear-gradient(135deg,#cbded8_0%,#ecf4ec_46%,#a9d4cd_100%)]'
const wallpaperClass =
  'pointer-events-none absolute inset-0 opacity-[0.92] bg-[linear-gradient(115deg,transparent_0_48%,rgba(20,38,45,0.08)_48.2%_48.7%,transparent_49%),linear-gradient(28deg,transparent_0_52%,rgba(255,255,255,0.38)_52.2%_52.6%,transparent_53%),radial-gradient(900px_520px_at_50%_78%,rgba(47,106,74,0.28),transparent_62%)] after:absolute after:inset-0 after:bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.46)_1px,transparent_1px)] after:bg-[length:42px_42px] after:opacity-15 after:[mask-image:linear-gradient(180deg,black,transparent_86%)] after:content-[""]'
const menuBarClass =
  'relative z-[2147483000] grid h-[42px] grid-cols-[1fr_minmax(180px,340px)_1fr] items-center gap-4 border-b border-[rgba(20,38,45,0.13)] bg-[rgba(239,249,244,0.72)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-[18px] max-[720px]:grid-cols-[1fr_auto]'
const menuButtonClass =
  'cursor-pointer appearance-none border-0 bg-transparent font-[inherit] text-[0.82rem] font-extrabold text-[rgba(20,38,45,0.72)] max-[720px]:hidden'
const desktopIconClass =
  'grid min-h-[94px] w-[86px] cursor-pointer appearance-none justify-items-center gap-1 rounded-[10px] border border-transparent bg-transparent text-center font-[inherit] text-[#14262d] hover:border-[rgba(255,255,255,0.44)] hover:bg-[rgba(255,255,255,0.2)] focus-visible:border-[rgba(255,255,255,0.44)] focus-visible:bg-[rgba(255,255,255,0.2)] focus-visible:outline-none max-[720px]:w-[74px]'
const desktopIconTileClass =
  'grid h-[58px] w-[58px] place-items-center rounded-[17px] border border-[rgba(255,255,255,0.48)] bg-[linear-gradient(145deg,rgba(255,255,255,0.68),rgba(255,255,255,0.12)),linear-gradient(135deg,color-mix(in_oklab,var(--accent)_82%,white),var(--accent))] text-[#14262d] shadow-[0_18px_34px_rgba(20,38,45,0.14),inset_0_1px_0_rgba(255,255,255,0.8)] max-[720px]:h-12 max-[720px]:w-12 max-[720px]:rounded-[14px]'
const windowBaseClass =
  'absolute top-0 left-0 z-10 flex w-[min(720px,calc(100vw_-_1.5rem))] max-h-[min(640px,calc(100svh_-_7.25rem))] origin-center flex-col overflow-hidden rounded-xl border border-[rgba(20,38,45,0.18)] bg-[rgba(250,252,247,0.9)] shadow-[0_34px_92px_rgba(20,38,45,0.28),inset_0_1px_0_rgba(255,255,255,0.76)] backdrop-blur-[22px] will-change-[transform,opacity,filter,width,height] max-[720px]:w-[calc(100vw_-_1rem)] max-[720px]:max-h-[calc(100svh_-_8.4rem)]'
const maximizedWindowClass = 'max-h-[calc(100svh_-_132px)] rounded-[14px] max-[720px]:max-h-[calc(100svh_-_7rem)]'
const titlebarClass =
  'grid min-h-[42px] cursor-grab select-none grid-cols-[104px_1fr_78px] items-center border-b border-[rgba(20,38,45,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(235,244,238,0.72))] px-3 active:cursor-grabbing max-[720px]:grid-cols-[74px_1fr_44px]'
const trafficClass =
  'relative grid h-[0.82rem] w-[0.82rem] cursor-pointer appearance-none place-items-center rounded-full border border-[rgba(20,38,45,0.16)] font-[inherit] text-[rgba(20,38,45,0.58)] before:absolute before:scale-50 before:opacity-0 before:transition before:content-[""] after:absolute after:scale-50 after:opacity-0 after:transition after:content-[""] group-hover/titlebar:before:scale-100 group-hover/titlebar:before:opacity-100 group-hover/titlebar:after:scale-100 group-hover/titlebar:after:opacity-100 focus-visible:before:scale-100 focus-visible:before:opacity-100 focus-visible:after:scale-100 focus-visible:after:opacity-100'
const dockButtonClass =
  'group relative grid h-[54px] w-[54px] cursor-pointer appearance-none place-items-center rounded-[14px] border border-[rgba(20,38,45,0.1)] bg-[rgba(255,255,255,0.58)] font-[inherit] text-[#173a40] transition hover:-translate-y-1 hover:outline-none focus-visible:-translate-y-1 focus-visible:outline-none max-[720px]:h-12 max-[720px]:w-12'

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

    if (!stravaIsVisible || stravaResult || stravaLoading) return

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

  return (
    <main className={osShellClass}>
      <div className={wallpaperClass} />
      <header className={menuBarClass}>
        <div className="flex min-w-0 items-center gap-2">
          <img
            className="h-[1.55rem] w-[1.55rem] rounded-full border border-[rgba(255,255,255,0.78)] object-cover object-[50%_31%] shadow-[0_3px_10px_rgba(20,38,45,0.16),0_0_0_1px_rgba(20,38,45,0.08)]"
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
        <div className="flex min-h-7 w-full items-center justify-center gap-2 justify-self-center rounded-full border border-[rgba(20,38,45,0.1)] bg-[rgba(255,255,255,0.54)] text-[0.78rem] font-bold text-[rgba(20,38,45,0.58)] max-[720px]:hidden">
          <Search aria-hidden="true" size={15} />
          <span>Search Felix&apos;s computer</span>
        </div>
        <div className="flex items-center gap-2.5 justify-self-end text-[0.82rem] font-extrabold text-[rgba(20,38,45,0.68)]">
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
              onGithubRefresh={() => {
                setGithubData(null)
                setGithubError(null)
              }}
              onStravaRefresh={() => {
                setStravaResult(null)
                setStravaError(null)
              }}
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
            <span className="max-w-[82px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.76rem] font-black leading-tight text-[rgba(20,38,45,0.88)]">
              {app.title}
            </span>
            <small className="text-[0.64rem] font-extrabold text-[rgba(20,38,45,0.58)]">
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
            ? 'border-[#fc4c02]/45 bg-[#111]'
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
        <div className="flex items-center justify-center gap-2 text-[0.82rem] font-black text-[rgba(20,38,45,0.74)]">
          <ActiveAppIcon aria-hidden="true" size={16} />
          <span>{activeAppTitle}</span>
        </div>
        <span className="justify-self-end text-[0.72rem] font-black text-[rgba(20,38,45,0.5)] max-[720px]:hidden">
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
      className="absolute bottom-4 left-1/2 z-[2147483000] flex max-w-[calc(100%_-_1rem)] -translate-x-1/2 gap-1.5 rounded-[18px] border border-[rgba(255,255,255,0.44)] bg-[rgba(239,249,244,0.62)] p-2 shadow-[0_18px_52px_rgba(20,38,45,0.2)] backdrop-blur-[22px]"
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
            <span className="pointer-events-none absolute bottom-[calc(100%_+_0.48rem)] translate-y-[3px] whitespace-nowrap rounded-[7px] bg-[rgba(20,38,45,0.9)] px-1.5 py-1 text-[0.68rem] font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
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
