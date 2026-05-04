import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Bike,
  Battery,
  Code2,
  FileText,
  Github,
  MountainSnow,
  Search,
  Server,
  Terminal,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type DesktopSearch = {
  app: 'home' | 'none'
  minimized: boolean
  maximized: boolean
  x: number
  y: number
}

const defaultWindow = {
  app: 'home',
  minimized: false,
  maximized: false,
  x: 84,
  y: 92,
} satisfies DesktopSearch

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): DesktopSearch => ({
    app: search.app === 'none' ? 'none' : 'home',
    minimized: search.minimized === true || search.minimized === 'true',
    maximized: search.maximized === true || search.maximized === 'true',
    x: parseCoordinate(search.x, defaultWindow.x),
    y: parseCoordinate(search.y, defaultWindow.y),
  }),
  component: Desktop,
})

const desktopApps = [
  {
    id: 'home',
    title: 'home.mdx',
    subtitle: 'Start here',
    icon: FileText,
    accent: '#f6c85f',
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Coming soon',
    icon: Code2,
    accent: '#60d7cf',
  },
  {
    id: 'infra',
    title: 'Infra',
    subtitle: 'Coming soon',
    icon: Server,
    accent: '#8de5db',
  },
  {
    id: 'outside',
    title: 'Outside',
    subtitle: 'Coming soon',
    icon: MountainSnow,
    accent: '#f07f5a',
  },
]

const dockApps = [
  { id: 'home', label: 'Editor', icon: FileText },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'rides', label: 'Routes', icon: Bike },
  { id: 'github', label: 'GitHub', icon: Github },
]

function parseCoordinate(value: unknown, fallback: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) return fallback

  return Math.max(16, Math.min(parsed, 620))
}

function Desktop() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/' })
  const [position, setPosition] = useState({ x: search.x, y: search.y })
  const [windowExit, setWindowExit] = useState<'close' | 'minimize'>('close')
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const editorDocumentRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setPosition({ x: search.x, y: search.y })
  }, [search.x, search.y])

  useEffect(() => {
    if (search.app === 'home' && !search.minimized) {
      editorDocumentRef.current?.scrollTo({ top: 0 })
    }
  }, [search.app, search.minimized])

  const updateWindow = (next: Partial<DesktopSearch>) => {
    void navigate({
      search: {
        ...search,
        ...next,
      },
    })
  }

  const openHome = () => {
    updateWindow({ app: 'home', minimized: false })
  }

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || search.maximized) return

    dragging.current = true
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveWindow = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return

    const nextX = Math.max(12, Math.min(event.clientX - dragOffset.current.x, window.innerWidth - 360))
    const nextY = Math.max(54, Math.min(event.clientY - dragOffset.current.y, window.innerHeight - 180))
    setPosition({ x: nextX, y: nextY })
  }

  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return

    dragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    updateWindow({ x: Math.round(position.x), y: Math.round(position.y) })
  }

  const closeHome = () => {
    setWindowExit('close')
    updateWindow({ app: 'none', minimized: false, maximized: false })
  }

  const minimizeHome = () => {
    setWindowExit('minimize')
    updateWindow({ minimized: true })
  }

  const toggleMaximizeHome = () => {
    updateWindow({ maximized: !search.maximized, minimized: false })
  }

  const homeIsOpen = search.app === 'home' && !search.minimized
  const homeIsRunning = search.app === 'home'
  const windowAnimation = search.maximized
    ? {
        x: 16,
        y: 58,
        width: 'calc(100vw - 32px)',
        height: 'calc(100svh - 132px)',
        scale: 1,
        opacity: 1,
      }
    : {
        x: position.x,
        y: position.y,
        width: 'min(720px, calc(100vw - 1.5rem))',
        height: 'auto',
        scale: 1,
        opacity: 1,
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

      <section className="desktop-grid" aria-label="Desktop shortcuts">
        {desktopApps.map((app) => {
          const Icon = app.icon
          const isHome = app.id === 'home'

          return (
            <button
              key={app.id}
              type="button"
              className="desktop-icon"
              onClick={isHome ? openHome : undefined}
              aria-label={isHome ? 'Open home.mdx' : `${app.title} coming soon`}
            >
              <span className="desktop-icon__tile" style={{ '--accent': app.accent } as React.CSSProperties}>
                <Icon aria-hidden="true" size={28} />
              </span>
              <span>{app.title}</span>
              <small>{app.subtitle}</small>
            </button>
          )
        })}
      </section>

      <AnimatePresence>
        {homeIsOpen ? (
          <motion.section
            key="home-window"
            layout
            className={`os-window text-editor${search.maximized ? ' os-window--maximized' : ''}`}
            initial={{
              x: position.x + 38,
              y: position.y + 28,
              opacity: 0,
              scale: 0.92,
              filter: 'blur(10px)',
            }}
            animate={{
              ...windowAnimation,
              filter: 'blur(0px)',
            }}
            exit={
              windowExit === 'minimize'
                ? {
                    x: 'calc(50vw - 120px)',
                    y: 'calc(100vh - 86px)',
                    opacity: 0,
                    scale: 0.22,
                    filter: 'blur(12px)',
                    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                  }
                : {
                    opacity: 0,
                    scale: 0.88,
                    y: position.y + 16,
                    filter: 'blur(12px)',
                    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                  }
            }
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 36,
              mass: 0.9,
            }}
            aria-label="home.mdx text editor window"
          >
          <div
            className="os-window__titlebar"
            onPointerDown={startDrag}
            onPointerMove={moveWindow}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onDoubleClick={toggleMaximizeHome}
          >
            <div className="traffic-lights">
              <motion.button
                type="button"
                className="traffic traffic--close"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={closeHome}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                aria-label="Close home.mdx"
              />
              <motion.button
                type="button"
                className="traffic traffic--minimize"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={minimizeHome}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                aria-label="Minimize home.mdx"
              />
              <motion.button
                type="button"
                className="traffic traffic--zoom"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={toggleMaximizeHome}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                aria-label={search.maximized ? 'Restore home.mdx' : 'Maximize home.mdx'}
              />
            </div>
            <div className="os-window__title">
              <FileText aria-hidden="true" size={16} />
              <span>home.mdx</span>
            </div>
            <span className="os-window__status">saved</span>
          </div>

          <div className="editor-toolbar" aria-label="Editor toolbar">
            <button type="button">Preview</button>
            <button type="button">Markdown</button>
            <button type="button">Word wrap</button>
          </div>

          <article ref={editorDocumentRef} className="editor-document">
            <p className="editor-path">~/felix-website/home.mdx</p>
            <div className="editor-hero">
              <img src="/felix-portrait.jpg" alt="Felix Wohnhaas" />
              <div>
                <p className="editor-kicker">home.mdx</p>
                <h1>Felix Wohnhaas</h1>
                <p>
                  I build software and infrastructure, and I like systems that
                  are direct, reliable, and easy to reason about.
                </p>
              </div>
            </div>

            <h2>What I care about</h2>
            <p>
              My work tends to sit where product engineering meets operations:
              turning ideas into usable interfaces, wiring them to dependable
              backend systems, and keeping the deployment path boring enough that
              teams can move quickly.
            </p>
            <p>
              I enjoy clean TypeScript, pragmatic architecture, good developer
              experience, observability, automation, and infrastructure that
              does not require heroics to operate. The best systems feel calm
              because the important tradeoffs have already been made explicit.
            </p>

            <h2>Outside the editor</h2>
            <p>
              A lot of my free time is spent moving through terrain: backcountry
              skiing, road biking, mountain biking, running, tennis, and whatever
              else fits the season. I like long efforts, good lines, and sports
              where preparation matters but conditions still get a vote.
            </p>
            <p>
              That mindset overlaps with engineering more than it sounds like it
              should. Read the terrain, choose the line, keep enough margin, and
              adjust when reality disagrees with the plan.
            </p>

            <h2>What this desktop will become</h2>
            <ul>
              <li>
                <strong>Projects:</strong> selected work, experiments, and tools
                I have built.
              </li>
              <li>
                <strong>Infra:</strong> notes on systems, deployments,
                observability, and operating software.
              </li>
              <li>
                <strong>Outside:</strong> routes, photos, activities, and the
                sports that keep me away from the keyboard.
              </li>
              <li>
                <strong>Writing:</strong> short technical notes and decisions
                worth remembering.
              </li>
            </ul>

            <h2>Now</h2>
            <p>
              This is the first window on the desktop: a small starting point
              for the rest of the site. The goal is for it to feel less like a
              portfolio page and more like opening a machine that reflects what
              I actually do.
            </p>
          </article>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <nav className="os-dock" aria-label="Application dock">
        {dockApps.map((app) => {
          const Icon = app.icon
          const isEditor = app.id === 'home'

          return (
            <button
              key={app.id}
              type="button"
              className={homeIsRunning && isEditor ? 'is-running' : undefined}
              onClick={isEditor ? openHome : undefined}
              aria-label={isEditor ? 'Open editor' : `${app.label} coming soon`}
            >
              <Icon aria-hidden="true" size={24} />
              <span>{app.label}</span>
            </button>
          )
        })}
      </nav>
    </main>
  )
}
