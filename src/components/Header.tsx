import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import SocialLinks from './SocialLinks'

const pageWrapClass = 'mx-auto w-[min(1080px,calc(100%_-_2rem))]'
const navLinkClass =
  'relative inline-flex items-center text-[var(--sea-ink-soft)] no-underline after:absolute after:left-0 after:bottom-[-6px] after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[linear-gradient(90deg,var(--lagoon),#7ed3bf)] after:transition-transform after:duration-200 after:content-[""] hover:text-[var(--sea-ink)] hover:after:scale-x-100 max-sm:after:bottom-[-4px]'
const activeNavLinkClass = `${navLinkClass} text-[var(--sea-ink)] after:scale-x-100`

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className={`${pageWrapClass} flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4`}>
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/home"
            search={{ minimized: false, maximized: false, x: 84, y: 92 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#56c6be,#2f6a4a)] text-[11px] font-extrabold tracking-tight text-white">
              FW
            </span>
            Felix Wohnhaas
          </Link>
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <SocialLinks className="hidden sm:flex" />
          <ThemeToggle />
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/home"
            search={{ minimized: false, maximized: false, x: 84, y: 92 }}
            className={navLinkClass}
            activeProps={{ className: activeNavLinkClass }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={navLinkClass}
            activeProps={{ className: activeNavLinkClass }}
          >
            About
          </Link>
          <a href="#contact" className={navLinkClass}>
            Contact
          </a>
        </div>
      </nav>
    </header>
  )
}
