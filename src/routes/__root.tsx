import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import type { GithubData } from '@/apps/github/types'
import { MobileAppPage } from '@/apps/mobile/MobileAppPage'
import { MobileNotesPage } from '@/apps/notes/MobileNotesPage'
import { Desktop } from '@/desktop/Desktop'
import type { NotesDocumentId } from '@/desktop/types'
import type { RouteApp } from '@/desktop/types'

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

function RootApp() {
  const { githubData, pathname, search } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      search: state.location.search,
      githubData: state.matches.find((match) => match.routeId === '/github')?.loaderData as
        | GithubData
        | undefined,
    }),
  })
  const routeApp = routeAppFromPathname(pathname, search)
  const isMobileNoteRoute = pathname === '/home' || pathname === '/cv'

  if (!routeApp) return <Outlet />

  return (
    <>
      <div className="hidden md:block">
        <Desktop initialGithubData={githubData ?? null} routeApp={routeApp} />
      </div>
      <div className="md:hidden">
        {isMobileNoteRoute ? (
          <MobileNotesPage document={mobileDocumentFromPathname(pathname)} />
        ) : routeApp === 'none' ? (
          <MobileNotesPage document="home" />
        ) : (
          <MobileAppPage initialGithubData={githubData ?? null} routeApp={routeApp} />
        )}
      </div>
    </>
  )
}

function routeAppFromPathname(pathname: string, search: Record<string, unknown>): RouteApp | null {
  if (pathname === '/') return 'none'
  if (pathname === '/browser') return { app: 'browser', url: browserUrlFromSearch(search) }
  if (pathname === '/game') return { app: 'game' }
  if (pathname === '/home') return { app: 'notes', document: 'home' }
  if (pathname === '/cv') return { app: 'notes', document: 'cv' }
  if (pathname === '/github') return { app: 'github' }
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
    <html lang="en" className="light" data-theme="light" style={{ colorScheme: 'light' }}>
      <head>
        <HeadContent />
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
