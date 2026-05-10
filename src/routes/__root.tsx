import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import type { GithubData } from '@/apps/github/types'
import { MobileNotesPage } from '@/apps/notes/MobileNotesPage'
import { Desktop } from '@/desktop/Desktop'
import type { NotesDocumentId } from '@/desktop/types'
import type { RouteApp } from '@/desktop/types'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

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

  if (!routeApp) return <Outlet />

  return (
    <>
      <div className="hidden md:block">
        <Desktop initialGithubData={githubData ?? null} routeApp={routeApp} />
      </div>
      <div className="md:hidden">
        <MobileNotesPage document={mobileDocumentFromPathname(pathname)} />
      </div>
    </>
  )
}

function routeAppFromPathname(pathname: string, search: Record<string, unknown>): RouteApp | null {
  if (pathname === '/') return 'none'
  if (pathname === '/browser') return { app: 'browser', url: browserUrlFromSearch(search) }
  if (pathname === '/home') return { app: 'notes', document: 'home' }
  if (pathname === '/cv') return { app: 'notes', document: 'cv' }
  if (pathname === '/github') return { app: 'github' }
  if (pathname === '/help') return { app: 'help' }
  if (pathname === '/issues') return { app: 'issues' }
  if (pathname === '/settings') return { app: 'settings' }
  if (pathname === '/skills') return { app: 'skills' }
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
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
        <Scripts />
      </body>
    </html>
  )
}
