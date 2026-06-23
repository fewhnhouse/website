import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe2,
  Lock,
  RotateCw,
  Search,
} from '@/components/PixelIcon'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  osAppHeight,
  osAppShellClass,
  osBtnIconClass,
  osBtnSmClass,
  osInputClass,
} from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

type BrowserAppProps = {
  initialUrl?: string
}

const defaultUrl = 'https://www.google.com/search?igu=1'
const linkedInUrl = 'https://www.linkedin.com/in/felix-wohnhaas/'
const browserIconButtonClass = osBtnIconClass

const bookmarks = [
  {
    label: 'Google',
    url: 'https://www.google.com/search?igu=1',
  },
  {
    label: 'LinkedIn',
    url: linkedInUrl,
  },
  {
    label: 'GitHub',
    url: 'https://github.com/fewhnhouse',
  },
] as const

export function BrowserApp({ initialUrl }: BrowserAppProps) {
  const normalizedInitialUrl = useMemo(() => normalizeNavigationTarget(initialUrl), [initialUrl])
  const [history, setHistory] = useState([normalizedInitialUrl ?? defaultUrl])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [address, setAddress] = useState(history[historyIndex] ?? defaultUrl)
  const [frameKey, setFrameKey] = useState(0)
  const lastRouteUrl = useRef(normalizedInitialUrl)
  const currentUrl = history[historyIndex] ?? defaultUrl
  const currentUrlInfo = getUrlInfo(currentUrl)
  const isProbablyBlocked = isKnownFrameBlockedUrl(currentUrl)

  useEffect(() => {
    const nextUrl = normalizeNavigationTarget(initialUrl)

    if (!nextUrl || nextUrl === lastRouteUrl.current) return

    lastRouteUrl.current = nextUrl
    setHistory((current) => [...current, nextUrl])
    setHistoryIndex((current) => current + 1)
    setAddress(nextUrl)
    setFrameKey((current) => current + 1)
  }, [initialUrl])

  const navigateTo = (rawTarget: string) => {
    const nextUrl = normalizeNavigationTarget(rawTarget)

    if (!nextUrl) return

    setHistory((current) => [...current.slice(0, historyIndex + 1), nextUrl])
    setHistoryIndex((current) => current + 1)
    setAddress(nextUrl)
    setFrameKey((current) => current + 1)
  }

  const submitAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formAddress = event.currentTarget.elements.namedItem('address')
    const nextAddress = formAddress instanceof HTMLInputElement ? formAddress.value : address

    navigateTo(nextAddress)
  }

  const goBack = () => {
    setHistoryIndex((current) => Math.max(0, current - 1))
  }

  const goForward = () => {
    setHistoryIndex((current) => Math.min(history.length - 1, current + 1))
  }

  const reload = () => {
    setFrameKey((current) => current + 1)
  }

  const openExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`${osAppShellClass} ${osAppHeight.tall} bg-bg-base`}>
      <div className="grid gap-2 border-b-2 border-ink bg-foam p-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            className={browserIconButtonClass}
            onClick={goBack}
            disabled={historyIndex === 0}
            aria-label="Go back"
          >
            <ArrowLeft aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            className={browserIconButtonClass}
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            aria-label="Go forward"
          >
            <ArrowRight aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            className={browserIconButtonClass}
            onClick={reload}
            aria-label="Reload page"
          >
            <RotateCw aria-hidden="true" size={15} />
          </button>
          <form className="min-w-0 flex-1" onSubmit={submitAddress}>
            <label className="relative block">
              <span className="sr-only">Search or enter website</span>
              <Lock
                aria-hidden="true"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink"
                size={14}
              />
              <input
                name="address"
                className={cn(osInputClass, 'h-8 pl-8 pr-10')}
                value={address}
                onChange={(event) => setAddress(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return

                  event.preventDefault()
                  navigateTo(event.currentTarget.value)
                }}
                placeholder="Search Google or enter a website"
                spellCheck={false}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center border-2 border-transparent text-ink transition hover:border-ink hover:bg-foam focus-visible:outline-none"
                aria-label="Open address"
              >
                <Search aria-hidden="true" size={14} />
              </button>
            </label>
          </form>
          <button
            type="button"
            className={browserIconButtonClass}
            onClick={openExternal}
            aria-label="Open current page externally"
          >
            <ExternalLink aria-hidden="true" size={15} />
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {bookmarks.map((bookmark) => (
            <button
              key={bookmark.url}
              type="button"
              className={osBtnSmClass}
              onClick={() => navigateTo(bookmark.url)}
            >
              <Globe2 aria-hidden="true" size={13} />
              {bookmark.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        {isProbablyBlocked ? (
          <div className="absolute inset-x-0 top-0 z-10 flex items-start gap-2 border-b-2 border-ink bg-link-hover-bg px-3 py-2 text-caption font-bold text-ink shadow-chip">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-lagoon-deep" size={15} />
            <p className="m-0 min-w-0">
              {currentUrlInfo.host} often blocks embedded browsers. Use the external button if the
              page below stays blank.
            </p>
          </div>
        ) : null}
        <iframe
          key={`${currentUrl}-${frameKey}`}
          className="h-full min-h-[420px] w-full border-0 bg-white [.os-window--maximized_&]:min-h-0"
          title={currentUrlInfo.title}
          src={currentUrl}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}

function normalizeNavigationTarget(rawTarget: string | undefined) {
  const trimmed = rawTarget?.trim()

  if (!trimmed) return null

  if (looksLikeUrl(trimmed)) {
    return withProtocol(trimmed)
  }

  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^localhost(:\d+)?(\/|$)/i.test(value) || value.includes('.')
}

function withProtocol(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  if (/^localhost(:\d+)?(\/|$)/i.test(value)) return `http://${value}`

  return `https://${value}`
}

function getUrlInfo(url: string) {
  try {
    const parsed = new URL(url)

    return {
      host: parsed.host,
      title: `${parsed.host} browser frame`,
    }
  } catch {
    return {
      host: 'This site',
      title: 'Browser frame',
    }
  }
}

function isKnownFrameBlockedUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '')

    return [
      'google.com',
      'linkedin.com',
      'github.com',
      'x.com',
      'twitter.com',
    ].some((blockedHost) => hostname === blockedHost || hostname.endsWith(`.${blockedHost}`))
  } catch {
    return false
  }
}
