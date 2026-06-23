import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AskApp } from '@/apps/ask/AskApp'
import { BrowserApp } from '@/apps/browser/BrowserApp'
import { ContactApp } from '@/apps/contact/ContactApp'
import { RunnerGameApp } from '@/apps/game/RunnerGameApp'
import { GithubApp } from '@/apps/github/GithubApp'
import { getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { GuestbookApp } from '@/apps/guestbook/GuestbookApp'
import { HelpApp } from '@/apps/help/HelpApp'
import { IssuesApp } from '@/apps/issues/IssuesApp'
import { getIssuesBoardData } from '@/apps/issues/issuesData'
import type { IssuesBoardData, ProjectIssue } from '@/apps/issues/types'
import { SettingsApp } from '@/apps/settings/SettingsApp'
import { StravaApp } from '@/apps/strava/StravaApp'
import { getStravaData, type StravaDataResult } from '@/apps/strava/stravaData'
import { TerminalApp } from '@/apps/terminal/TerminalApp'
import { defaultDesktopSettings, isWallpaperId, wallpaperOptions } from '@/desktop/desktopSettings'
import type { AppId, NotesDocumentId, RouteApp } from '@/desktop/types'

type MobileAppPageProps = {
  initialGithubData?: GithubData | null
  initialStravaResult?: StravaDataResult | null
  routeApp: Exclude<RouteApp, 'none'>
}

export function MobileAppPage({
  initialGithubData = null,
  initialStravaResult = null,
  routeApp,
}: MobileAppPageProps) {
  const navigate = useNavigate()
  const [githubData, setGithubData] = useState<GithubData | null>(initialGithubData)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [issuesData, setIssuesData] = useState<IssuesBoardData | null>(null)
  const [issuesError, setIssuesError] = useState<string | null>(null)
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [stravaResult, setStravaResult] = useState<StravaDataResult | null>(initialStravaResult)
  const [stravaError, setStravaError] = useState<string | null>(null)
  const [stravaLoading, setStravaLoading] = useState(false)
  const [screensaverMinutes, setScreensaverMinutes] = useState(
    defaultDesktopSettings.screensaverMinutes,
  )
  const [wallpaper, setWallpaper] = useState(defaultDesktopSettings.wallpaper)
  const stravaRequestAttempted = useRef(false)

  useEffect(() => {
    if (initialGithubData) {
      setGithubData(initialGithubData)
      setGithubError(null)
    }
  }, [initialGithubData])

  useEffect(() => {
    if (initialStravaResult) {
      setStravaResult(initialStravaResult)
      setStravaError(null)
      stravaRequestAttempted.current = true
    }
  }, [initialStravaResult])

  useEffect(() => {
    if (routeApp.app !== 'github' || githubData || githubLoading) return

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
  }, [githubData, githubLoading, routeApp.app])

  useEffect(() => {
    if (routeApp.app !== 'issues' || issuesData || issuesLoading) return

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
  }, [issuesData, issuesLoading, routeApp.app])

  useEffect(() => {
    if (
      routeApp.app !== 'strava' ||
      stravaResult ||
      stravaLoading ||
      stravaRequestAttempted.current
    ) {
      return
    }

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
  }, [routeApp.app, stravaLoading, stravaResult])

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

  const openApp = useCallback(
    (app: AppId, document?: NotesDocumentId) => {
      void navigate({ to: routeForApp(app, document), search: defaultMobileSearch })
    },
    [navigate],
  )

  return (
    <main className="felix-mobile-app min-h-[100svh] bg-foam text-os-ink">
      {routeApp.app === 'ask' ? <AskApp onOpenApp={openApp} /> : null}
      {routeApp.app === 'browser' ? <BrowserApp initialUrl={routeApp.url} /> : null}
      {routeApp.app === 'contact' ? <ContactApp /> : null}
      {routeApp.app === 'game' ? <RunnerGameApp /> : null}
      {routeApp.app === 'github' ? (
        <GithubApp
          data={githubData}
          error={githubError}
          loading={githubLoading}
          onRefresh={refreshGithub}
        />
      ) : null}
      {routeApp.app === 'guestbook' ? <GuestbookApp /> : null}
      {routeApp.app === 'help' ? <HelpApp /> : null}
      {routeApp.app === 'issues' ? (
        <IssuesApp
          data={issuesData}
          error={issuesError}
          loading={issuesLoading}
          onIssueCreated={addCreatedIssue}
          onRefresh={refreshIssues}
        />
      ) : null}
      {routeApp.app === 'settings' ? (
        <SettingsApp
          screensaverMinutes={screensaverMinutes}
          selectedWallpaper={wallpaper}
          wallpaperOptions={wallpaperOptions}
          onPreviewScreensaver={() => undefined}
          onScreensaverMinutesChange={setScreensaverMinutes}
          onWallpaperChange={(value) => {
            if (isWallpaperId(value)) setWallpaper(value)
          }}
        />
      ) : null}
      {routeApp.app === 'strava' ? (
        <StravaApp
          error={stravaError}
          loading={stravaLoading}
          onRefresh={refreshStrava}
          result={stravaResult}
        />
      ) : null}
      {routeApp.app === 'terminal' ? <TerminalApp onOpenApp={openApp} /> : null}
    </main>
  )
}

const defaultMobileSearch = {
  maximized: false,
  minimized: false,
  x: 84,
  y: 92,
}

function routeForApp(app: AppId, document?: NotesDocumentId) {
  if (app === 'ask') return '/ask'
  if (app === 'browser') return '/browser'
  if (app === 'contact') return '/contact'
  if (app === 'game') return '/game'
  if (app === 'notes') return document === 'cv' ? '/cv' : '/home'
  if (app === 'github') return '/github'
  if (app === 'guestbook') return '/guestbook'
  if (app === 'help') return '/help'
  if (app === 'issues') return '/issues'
  if (app === 'settings') return '/settings'
  if (app === 'strava') return '/strava'
  if (app === 'terminal') return '/terminal'

  return '/'
}
