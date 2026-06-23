import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import { GITHUB_CACHE_MS, getGithubData } from '@/apps/github/githubData'
import type { GithubData } from '@/apps/github/types'
import { getStravaData, type StravaDataResult } from '@/apps/strava/stravaData'
import { MobileAppPage } from '@/apps/mobile/MobileAppPage'
import { MobileNotesPage } from '@/apps/notes/MobileNotesPage'
import { BootScreen } from '@/desktop/BootScreen'
import { Desktop } from '@/desktop/Desktop'
import type { NotesDocumentId } from '@/desktop/types'
import type { RouteApp } from '@/desktop/types'
import { useBootSequence } from '@/desktop/useBootSequence'

import appCss from '../styles.css?url'

const DevtoolsPanel = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }] = await Promise.all([
        import('@tanstack/react-devtools'),
        import('@tanstack/react-router-devtools'),
      ])

      return {
        default: function DevtoolsPanel() {
          return (
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )
        },
      }
    })
  : null

export const Route = createRootRoute({
  loader: async () => {
    const [github, strava] = await Promise.all([
      getGithubData().catch(() => null),
      getStravaData().catch(() => null),
    ])

    return { github, strava }
  },
  staleTime: GITHUB_CACHE_MS,
  gcTime: GITHUB_CACHE_MS * 2,
  component: RootApp,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Felix Wohnhaas',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

type RootLoaderData = {
  github: GithubData | null
  strava: StravaDataResult | null
}

function RootApp() {
  const { githubData, pathname, search, stravaResult } = useRouterState({
    select: (state) => {
      const rootData = state.matches.find((match) => match.routeId === '__root__')?.loaderData as
        | RootLoaderData
        | undefined
      const githubRouteData = state.matches.find((match) => match.routeId === '/github')
        ?.loaderData as GithubData | undefined
      const stravaRouteData = state.matches.find((match) => match.routeId === '/strava')
        ?.loaderData as StravaDataResult | undefined

      return {
        pathname: state.location.pathname,
        search: state.location.search,
        githubData: githubRouteData ?? rootData?.github ?? undefined,
        stravaResult: stravaRouteData ?? rootData?.strava ?? undefined,
      }
    },
  })
  const routeApp = routeAppFromPathname(pathname, search)
  const isMobileNoteRoute = pathname === '/home' || pathname === '/cv'
  const { showBoot, completeBoot } = useBootSequence()

  if (!routeApp) return <Outlet />

  return (
    <>
      <div className="hidden md:block">
        <Desktop
          initialGithubData={githubData ?? null}
          initialStravaResult={stravaResult ?? null}
          routeApp={routeApp}
        />
      </div>
      <div className="md:hidden">
        {isMobileNoteRoute ? (
          <MobileNotesPage document={mobileDocumentFromPathname(pathname)} />
        ) : routeApp === 'none' ? (
          <MobileNotesPage document="home" />
        ) : (
          <MobileAppPage
            initialGithubData={githubData ?? null}
            initialStravaResult={stravaResult ?? null}
            routeApp={routeApp}
          />
        )}
      </div>
      {showBoot ? <BootScreen onComplete={completeBoot} /> : null}
    </>
  )
}

function routeAppFromPathname(pathname: string, search: Record<string, unknown>): RouteApp | null {
  if (pathname === '/') return 'none'
  if (pathname === '/ask') return { app: 'ask' }
  if (pathname === '/browser') return { app: 'browser', url: browserUrlFromSearch(search) }
  if (pathname === '/contact') return { app: 'contact' }
  if (pathname === '/game') return { app: 'game' }
  if (pathname === '/home') return { app: 'notes', document: 'home' }
  if (pathname === '/cv') return { app: 'notes', document: 'cv' }
  if (pathname === '/github') return { app: 'github' }
  if (pathname === '/guestbook') return { app: 'guestbook' }
  if (pathname === '/help') return { app: 'help' }
  if (pathname === '/issues') return { app: 'issues' }
  if (pathname === '/settings') return { app: 'settings' }
  if (pathname === '/strava') return { app: 'strava' }
  if (pathname === '/terminal') return { app: 'terminal' }

  return null
}

function browserUrlFromSearch(search: Record<string, unknown>) {
  return typeof search.url === 'string' && search.url.trim() ? search.url : undefined
}

function mobileDocumentFromPathname(pathname: string): NotesDocumentId {
  return pathname === '/cv' ? 'cv' : 'home'
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="light"
      data-theme="light"
      style={{ colorScheme: 'light' }}
      // The pre-paint boot script (in <head>) may set data-boot-done before
      // hydration; that attribute is intentionally absent from the SSR HTML.
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
        {/* Runs before first paint: hide the SSR'd boot overlay for return
            visitors so they never see it flash, while new visitors get it
            immediately (no flash of the desktop). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('felixos.boot.completed')==='1'){document.documentElement.setAttribute('data-boot-done','1')}}catch(e){}",
          }}
        />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
        {DevtoolsPanel ? (
          <Suspense fallback={null}>
            <DevtoolsPanel />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
