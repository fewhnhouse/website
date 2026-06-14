import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Notebook, Send } from '@/components/PixelIcon'

import {
  osAppHeight,
  osAppShellClass,
  osBtnPrimaryClass,
  osInputClass,
  osPanelBareClass,
  osScrollClass,
} from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

import { decodeEntities, formatRelativeTime } from './format'
import type { GuestbookEntry } from './types'

const entriesEndpoint = '/api/guestbook/entries'
const NAME_MAX = 40
const MESSAGE_MAX = 280

export function GuestbookApp() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(entriesEndpoint, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const parsed = (await response.json()) as unknown
        return Array.isArray(parsed) ? (parsed as GuestbookEntry[]) : []
      })
      .then((loaded) => {
        if (cancelled) return
        setEntries(loaded)
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to load guestbook entries', error)
        setLoadError("Couldn't load the guestbook.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()
    if (!trimmedName || !trimmedMessage) return

    setSubmitting(true)
    setSubmitError(null)

    // Optimistic entry — replaced by the server's canonical record on success.
    const optimisticId = `optimistic-${Date.now()}`
    const optimistic: GuestbookEntry = {
      id: optimisticId,
      name: trimmedName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    }
    setEntries((current) => [optimistic, ...current])

    try {
      const response = await fetch(entriesEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage, website }),
      })

      const payload = (await response.json().catch(() => null)) as
        | GuestbookEntry
        | { error?: string }
        | null

      if (!response.ok) {
        const errorMessage =
          payload && 'error' in payload && payload.error
            ? payload.error
            : `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      const saved = payload as GuestbookEntry
      setEntries((current) => [saved, ...current.filter((entry) => entry.id !== optimisticId)])
      setName('')
      setMessage('')
    } catch (error) {
      setEntries((current) => current.filter((entry) => entry.id !== optimisticId))
      setSubmitError(error instanceof Error ? error.message : 'Failed to sign the guestbook.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={cn(osAppShellClass, osAppHeight.default)} aria-label="Guestbook">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">GUESTBOOK</p>
          <strong className="os-section-header__title">Leave a mark</strong>
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
        <div className={cn(osPanelBareClass, 'p-4')}>
          <header className="mb-3 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink shadow-chip">
              <Notebook aria-hidden="true" size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="m-0 text-[1.12rem] tracking-normal">Sign the guestbook</h2>
              <p className="mt-1 mb-0 text-meta leading-relaxed text-os-ink-muted">
                Drop a short note. Previous visitors are listed below.
              </p>
            </div>
          </header>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Name
              <input
                className={osInputClass}
                maxLength={NAME_MAX}
                onChange={(event) => {
                  setName(event.currentTarget.value)
                  setSubmitError(null)
                }}
                placeholder="Who's visiting?"
                required
                value={name}
              />
            </label>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Message
              <textarea
                className={cn(osInputClass, 'min-h-24 resize-y leading-relaxed')}
                maxLength={MESSAGE_MAX}
                onChange={(event) => {
                  setMessage(event.currentTarget.value)
                  setSubmitError(null)
                }}
                placeholder="Say hello..."
                required
                value={message}
              />
            </label>

            {/* Honeypot — hidden from real users, bots tend to fill it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input
                  autoComplete="off"
                  onChange={(event) => setWebsite(event.currentTarget.value)}
                  tabIndex={-1}
                  value={website}
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-caption font-black text-os-ink-muted">
                {message.length}/{MESSAGE_MAX}
              </span>
              <button
                type="submit"
                className={osBtnPrimaryClass}
                disabled={submitting || !name.trim() || !message.trim()}
              >
                <Send aria-hidden="true" size={16} />
                {submitting ? 'Signing...' : 'Sign guestbook'}
              </button>
            </div>
          </form>

          {submitError ? (
            <p className="mt-3 mb-0 border-2 border-ink bg-foam p-3 text-meta font-extrabold leading-relaxed text-os-ink-muted">
              {submitError}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          {loading ? (
            <p className="text-meta font-extrabold text-os-ink-muted">Loading entries...</p>
          ) : loadError ? (
            <p className="border-2 border-ink bg-foam p-3 text-meta font-extrabold leading-relaxed text-os-ink-muted">
              {loadError}
            </p>
          ) : entries.length === 0 ? (
            <p className="text-meta font-extrabold text-os-ink-muted">
              No entries yet — be the first to sign.
            </p>
          ) : (
            entries.map((entry) => <GuestbookEntryCard key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </section>
  )
}

function GuestbookEntryCard({ entry }: { entry: GuestbookEntry }) {
  return (
    <article className={cn(osPanelBareClass, 'p-3')}>
      <header className="flex items-baseline justify-between gap-3">
        <strong className="min-w-0 truncate text-[0.95rem] text-os-ink">
          {decodeEntities(entry.name)}
        </strong>
        <time
          className="shrink-0 text-caption font-black text-os-ink-muted"
          dateTime={entry.createdAt}
        >
          {formatRelativeTime(entry.createdAt)}
        </time>
      </header>
      <p className="mt-1.5 mb-0 whitespace-pre-wrap text-meta leading-relaxed text-os-ink">
        {decodeEntities(entry.message)}
      </p>
    </article>
  )
}
