import {
  Activity,
  CircleDot,
  CircleHelp,
  FileText,
  Gauge,
  Gamepad2,
  Github,
  Globe2,
  MonitorCog,
  Terminal,
} from 'lucide-react'
import { motion } from 'motion/react'
import type { PointerEvent, RefObject } from 'react'

import { BrowserApp } from '@/apps/browser/BrowserApp'
import { RunnerGameApp } from '@/apps/game/RunnerGameApp'
import { GithubApp } from '@/apps/github/GithubApp'
import type { GithubData } from '@/apps/github/types'
import { HelpApp } from '@/apps/help/HelpApp'
import { IssuesApp } from '@/apps/issues/IssuesApp'
import type { IssuesBoardData, ProjectIssue } from '@/apps/issues/types'
import type { NotesMarkdownByDocument } from '@/apps/notes/documents'
import { NotesApp } from '@/apps/notes/NotesApp'
import { SettingsApp } from '@/apps/settings/SettingsApp'
import { SkillsApp } from '@/apps/skills/SkillsApp'
import { StravaApp } from '@/apps/strava/StravaApp'
import type { StravaDataResult } from '@/apps/strava/stravaData'
import { TerminalApp } from '@/apps/terminal/TerminalApp'

import type { DesktopSettings } from './desktopSettings'
import { wallpaperOptions } from './desktopSettings'
import type { AppId, NotesDocumentId, WindowState } from './types'
import { windowAnimationFor, windowExitAnimation } from './windowAnimations'

const windowBaseClass =
  'absolute top-0 left-0 z-10 flex w-[min(720px,calc(100vw_-_1.5rem))] max-h-[min(640px,calc(100svh_-_7.25rem))] origin-center flex-col overflow-hidden rounded-window border border-os-border-strong bg-os-panel shadow-window backdrop-blur-[22px] will-change-[transform,opacity,filter,width,height] max-[720px]:w-[calc(100vw_-_1rem)] max-[720px]:max-h-[calc(100svh_-_8.4rem)]'
const maximizedWindowClass = 'max-h-none rounded-none border-x-0 border-t-0'
const titlebarClass =
  'grid min-h-titlebar cursor-grab select-none grid-cols-[104px_1fr_78px] items-center border-b border-os-border bg-[image:var(--os-titlebar-bg)] px-3 active:cursor-grabbing max-[720px]:grid-cols-[74px_1fr_44px]'
const trafficClass =
  'relative grid h-[0.82rem] w-[0.82rem] cursor-pointer appearance-none place-items-center rounded-full border border-os-border font-[inherit] text-os-ink-soft before:absolute before:scale-50 before:opacity-0 before:transition before:content-[""] after:absolute after:scale-50 after:opacity-0 after:transition after:content-[""] group-hover/titlebar:before:scale-100 group-hover/titlebar:before:opacity-100 group-hover/titlebar:after:scale-100 group-hover/titlebar:after:opacity-100 focus-visible:before:scale-100 focus-visible:before:opacity-100 focus-visible:after:scale-100 focus-visible:after:opacity-100'

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

export function DesktopWindow({
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
  const activeAppTitle = getAppWindowTitle(window.app)
  const ActiveAppIcon = getAppWindowIcon(window.app)

  return (
    <motion.section
      layout
      className={`${windowBaseClass} ${window.maximized ? 'os-window--maximized' : ''} ${getAppWindowClass(window.app)} ${
        window.maximized ? maximizedWindowClass : ''
      }`}
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
            className="bg-traffic-close before:h-[1.5px] before:w-[0.45rem] before:rotate-45 before:rounded-full before:bg-current after:h-[1.5px] after:w-[0.45rem] after:-rotate-45 after:rounded-full after:bg-current"
            label={`Close ${activeAppTitle}`}
            onClick={() => closeWindow(window)}
          />
          <TrafficButton
            className="bg-traffic-minimize before:h-[1.6px] before:w-[0.48rem] before:rounded-full before:bg-current"
            label={`Minimize ${activeAppTitle}`}
            onClick={() => minimizeWindow(window)}
          />
          <TrafficButton
            className="bg-traffic-maximize before:h-[0.38rem] before:w-[0.38rem] before:rounded-[2px] before:border-[1.5px] before:border-current"
            label={window.maximized ? `Restore ${activeAppTitle}` : `Maximize ${activeAppTitle}`}
            onClick={() => toggleMaximizeWindow(window)}
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-window font-black text-os-ink-muted">
          <ActiveAppIcon aria-hidden="true" size={16} />
          <span>{activeAppTitle}</span>
        </div>
        <span aria-hidden="true" className="justify-self-end" />
      </div>

      {window.app === 'browser' ? <BrowserApp initialUrl={window.url} /> : null}
      {window.app === 'game' ? <RunnerGameApp /> : null}
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

function getAppWindowTitle(app: AppId) {
  if (app === 'browser') return 'browser.app'
  if (app === 'game') return 'runner.app'
  if (app === 'github') return 'github.app'
  if (app === 'help') return 'help.app'
  if (app === 'issues') return 'issues.app'
  if (app === 'settings') return 'settings.app'
  if (app === 'skills') return 'skills.app'
  if (app === 'strava') return 'strava.app'
  if (app === 'terminal') return 'terminal.app'

  return 'notes.app'
}

function getAppWindowIcon(app: AppId) {
  if (app === 'browser') return Globe2
  if (app === 'game') return Gamepad2
  if (app === 'github') return Github
  if (app === 'help') return CircleHelp
  if (app === 'issues') return CircleDot
  if (app === 'settings') return MonitorCog
  if (app === 'skills') return Gauge
  if (app === 'strava') return Activity
  if (app === 'terminal') return Terminal

  return FileText
}

// Per-app size override. The base windowBaseClass caps every window at 720×640.
// Apps that prefer a larger window get an explicit override class.
// NOTE: classes must be string literals so Tailwind's JIT scanner sees them.
const appSizeClasses: Partial<Record<AppId, string>> = {
  browser: '!w-[min(980px,calc(100vw_-_1.5rem))] !max-h-[min(680px,calc(100svh_-_4.5rem))]',
  game: '!w-[min(900px,calc(100vw_-_1.5rem))] !max-h-[min(880px,calc(100svh_-_4.5rem))]',
  github: '!w-[min(920px,calc(100vw_-_1.5rem))]',
  issues: '!w-[min(980px,calc(100vw_-_1.5rem))] !max-h-[min(680px,calc(100svh_-_4.5rem))]',
  skills: '!w-[min(920px,calc(100vw_-_1.5rem))]',
  strava: '!w-[min(920px,calc(100vw_-_1.5rem))]',
  terminal: '!w-[min(760px,calc(100vw_-_1.5rem))]',
}

function getAppWindowSizeClass(app: AppId) {
  return appSizeClasses[app] ?? ''
}

function getAppWindowClass(app: AppId) {
  const sizeClass = getAppWindowSizeClass(app)
  const prefix = sizeClass ? `${sizeClass} ` : ''
  if (app === 'github') return `${prefix}bg-[rgba(246,248,250,0.94)]`
  if (app === 'browser') return `${prefix}bg-[rgba(248,249,255,0.94)]`
  if (app === 'game') return `${prefix}border-[#18464c] bg-[#081719]`
  if (app === 'help') return `${prefix}bg-[rgba(250,252,247,0.94)]`
  if (app === 'issues') return `${prefix}bg-[rgba(248,249,255,0.94)]`
  if (app === 'settings') return `${prefix}bg-[rgba(250,252,247,0.94)]`
  if (app === 'skills') return `${prefix}bg-[rgba(247,252,249,0.94)]`
  if (app === 'strava') return `${prefix}border-strava/45 bg-strava-bg`
  if (app === 'terminal') return `${prefix}border-[#17383b] bg-[#071416]`

  return prefix.trim()
}
