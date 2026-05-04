import { Battery, FileText, Github, Search, Wifi } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, RefObject } from 'react'

import { GithubApp } from '@/apps/github/GithubApp'
import { getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { HomeEditor } from '@/apps/home/HomeEditor'

import { desktopApps, dockApps } from './apps'
import type { RouteApp, WindowState } from './types'
import { useDesktopWindows } from './useDesktopWindows'

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

  const openHome = () => {
    openApp('home')
  }

  const openGithub = () => {
    openApp('github')
  }

  return (
    <main className="os-shell">
      <div className="os-wallpaper" />
      <header className="os-menubar">
        <div className="os-menubar__left">
          <img className="os-logo" src="/felix-portrait.jpg" alt="Felix Wohnhaas" />
          <strong>FelixOS</strong>
          <button type="button" onClick={openHome}>
            File
          </button>
          <button type="button">View</button>
          <button type="button">Help</button>
        </div>
        <div className="os-menubar__center">
          <Search aria-hidden="true" size={15} />
          <span>Search Felix&apos;s computer</span>
        </div>
        <div className="os-menubar__right">
          <Wifi aria-hidden="true" size={16} />
          <Battery aria-hidden="true" size={17} />
          <time dateTime="2026-05-04T13:30">13:30</time>
        </div>
      </header>

      <DesktopShortcuts openGithub={openGithub} openHome={openHome} />

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
              startDrag={startDrag}
              stopDrag={stopDrag}
              toggleMaximizeWindow={toggleMaximizeWindow}
              window={window}
              windowExit={windowExit}
              editorDocumentRef={editorDocumentRef}
            />
          ))}
      </AnimatePresence>

      <Dock openGithub={openGithub} openHome={openHome} windows={windows} />
    </main>
  )
}

function DesktopShortcuts({
  openGithub,
  openHome,
}: {
  openGithub: () => void
  openHome: () => void
}) {
  return (
    <section className="desktop-grid" aria-label="Desktop shortcuts">
      {desktopApps.map((app) => {
        const Icon = app.icon
        const isHome = app.id === 'home'
        const isGithub = app.id === 'github'

        return (
          <button
            key={app.id}
            type="button"
            className="desktop-icon"
            onClick={isHome ? openHome : isGithub ? openGithub : undefined}
            aria-label={
              isHome ? 'Open home.mdx' : isGithub ? 'Open GitHub' : `${app.title} coming soon`
            }
          >
            <span
              className="desktop-icon__tile"
              style={{ '--accent': app.accent } as CSSProperties}
            >
              <Icon aria-hidden="true" size={28} />
            </span>
            <span>{app.title}</span>
            <small>{app.subtitle}</small>
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
  startDrag: (event: PointerEvent<HTMLDivElement>, window: WindowState) => void
  stopDrag: (event: PointerEvent<HTMLDivElement>) => void
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
  startDrag,
  stopDrag,
  toggleMaximizeWindow,
  window,
  windowExit,
}: DesktopWindowProps) {
  const activeAppTitle = window.app === 'github' ? 'github.app' : 'home.mdx'
  const ActiveAppIcon = window.app === 'github' ? Github : FileText

  return (
    <motion.section
      layout
      className={`os-window ${
        window.app === 'github' ? 'bg-[rgba(246,248,250,0.94)]' : 'text-editor'
      }${window.maximized ? ' os-window--maximized' : ''}${focused ? ' is-focused' : ''}`}
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
        className="os-window__titlebar"
        onPointerDown={(event) => startDrag(event, window)}
        onPointerMove={moveWindow}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={() => toggleMaximizeWindow(window.app)}
      >
        <div className="traffic-lights">
          <TrafficButton
            className="traffic--close"
            label={`Close ${activeAppTitle}`}
            onClick={() => closeWindow(window.app)}
          />
          <TrafficButton
            className="traffic--minimize"
            label={`Minimize ${activeAppTitle}`}
            onClick={() => minimizeWindow(window.app)}
          />
          <TrafficButton
            className="traffic--zoom"
            label={window.maximized ? `Restore ${activeAppTitle}` : `Maximize ${activeAppTitle}`}
            onClick={() => toggleMaximizeWindow(window.app)}
          />
        </div>
        <div className="os-window__title">
          <ActiveAppIcon aria-hidden="true" size={16} />
          <span>{activeAppTitle}</span>
        </div>
        <span className="os-window__status">saved</span>
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
      className={`traffic ${className}`}
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
  windows,
}: {
  openGithub: () => void
  openHome: () => void
  windows: WindowState[]
}) {
  return (
    <nav className="os-dock" aria-label="Application dock">
      {dockApps.map((app) => {
        const Icon = app.icon
        const isEditor = app.id === 'home'
        const isGithub = app.id === 'github'
        const isRunning = windows.some((window) => window.app === app.id)

        return (
          <button
            key={app.id}
            type="button"
            className={isRunning ? 'is-running' : undefined}
            onClick={isEditor ? openHome : isGithub ? openGithub : undefined}
            aria-label={
              isEditor ? 'Open editor' : isGithub ? 'Open GitHub' : `${app.label} coming soon`
            }
          >
            <Icon aria-hidden="true" size={24} />
            <span>{app.label}</span>
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
          window.app === 'github'
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
