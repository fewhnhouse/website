import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { Send, Sparkles } from '@/components/PixelIcon'

import {
  osAppHeight,
  osAppShellClass,
  osBtnPrimaryClass,
  osChipClass,
  osInputClass,
  osScrollClass,
} from '@/apps/shared/appStyles'
import type { AppId, NotesDocumentId } from '@/desktop/types'
import { cn } from '@/lib/cn'

import { ASK_LIMITS, ASK_STARTERS, isOpenableAppId } from './askConfig'

type AskAppProps = {
  onOpenApp: (app: AppId, document?: NotesDocumentId) => void
}

function appTargetFor(appId: AppId): { app: AppId; document?: NotesDocumentId } {
  // The assistant maps "CV/resume" to the notes app; default that to the cv doc.
  if (appId === 'notes') return { app: 'notes', document: 'cv' }
  return { app: appId }
}

export function AskApp({ onOpenApp }: AskAppProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const openedToolCalls = useRef<Set<string>>(new Set())

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ask' }),
  })

  const isBusy = status === 'submitted' || status === 'streaming'

  // When the assistant calls open_app and the tool returns, open the window.
  useEffect(() => {
    for (const message of messages) {
      if (message.role !== 'assistant') continue
      for (const part of message.parts) {
        if (part.type !== 'tool-open_app') continue
        if (part.state !== 'output-available') continue
        if (openedToolCalls.current.has(part.toolCallId)) continue

        const output = part.output as { opened?: boolean; appId?: string } | undefined
        if (output?.opened && isOpenableAppId(output.appId)) {
          openedToolCalls.current.add(part.toolCallId)
          const target = appTargetFor(output.appId)
          onOpenApp(target.app, target.document)
        }
      }
    }
  }, [messages, onOpenApp])

  // Keep the latest message in view.
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, isBusy])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    if (trimmed.length > ASK_LIMITS.maxMessageChars) return
    void sendMessage({ text: trimmed })
    setInput('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit(input)
  }

  const overLimit = input.length > ASK_LIMITS.maxMessageChars
  const hasConversation = messages.length > 0

  return (
    <section className={cn(osAppShellClass, osAppHeight.default)} aria-label="Ask Felix">
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">ASK FELIX</p>
          <strong className="os-section-header__title">Chat about Felix</strong>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}
        aria-live="polite"
      >
        {!hasConversation ? (
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink shadow-chip">
                <Sparkles aria-hidden="true" size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 text-[1.12rem] tracking-normal">Ask me about Felix</h2>
                <p className="mt-1 mb-0 text-meta leading-relaxed text-os-ink-muted">
                  An AI assistant that answers questions about Felix's work, projects, and
                  background — and can open other FelixOS apps for you.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <p className="m-0 text-caption font-black text-os-ink-muted">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {ASK_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    className={osChipClass}
                    onClick={() => submit(starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {messages.map((message) => {
              const text = message.parts
                .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
                .map((part) => part.text)
                .join('')
              const openedApps = message.parts
                .filter((part) => part.type === 'tool-open_app')
                .map((part) => {
                  const output = (part as { output?: { appId?: string } }).output
                  return output?.appId
                })
                .filter((appId): appId is string => Boolean(appId))

              if (!text && openedApps.length === 0) return null

              const isUser = message.role === 'user'

              return (
                <li
                  key={message.id}
                  className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] border-2 border-ink p-3 text-meta leading-relaxed shadow-chip',
                      isUser ? 'bg-lagoon text-foam' : 'bg-foam text-os-ink',
                    )}
                  >
                    {text ? <p className="m-0 whitespace-pre-wrap">{text}</p> : null}
                    {openedApps.map((appId) => (
                      <p
                        key={appId}
                        className="m-0 mt-1 text-caption font-black uppercase tracking-wide text-os-ink-muted"
                      >
                        Opened {appId === 'notes' ? 'CV' : appId}
                      </p>
                    ))}
                  </div>
                </li>
              )
            })}

            {status === 'submitted' ? (
              <li className="flex justify-start">
                <div className="border-2 border-ink bg-foam p-3 text-meta text-os-ink-muted shadow-chip">
                  Thinking…
                </div>
              </li>
            ) : null}
          </ul>
        )}

        {error ? (
          <p className="mt-3 mb-0 border-2 border-ink bg-foam p-3 text-meta font-extrabold leading-relaxed text-os-ink-muted">
            {friendlyError(error)}
          </p>
        ) : null}
      </div>

      <form
        className="flex items-end gap-2 border-t-2 border-ink p-3"
        onSubmit={handleSubmit}
      >
        <label className="grid flex-1 gap-1">
          <span className="sr-only">Your message</span>
          <input
            className={osInputClass}
            value={input}
            maxLength={ASK_LIMITS.maxMessageChars + 1}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask about Felix…"
            aria-label="Ask about Felix"
          />
        </label>
        <button
          type="submit"
          className={osBtnPrimaryClass}
          disabled={isBusy || !input.trim() || overLimit}
        >
          <Send aria-hidden="true" size={16} />
          Send
        </button>
      </form>
    </section>
  )
}

const ASK_FALLBACK_ERROR =
  'The assistant is unavailable right now. Try the other FelixOS apps, or reach Felix via the Contact app.'

function friendlyError(error: Error): string {
  // The server returns friendly JSON ({"error": "..."}) for disabled / no-key /
  // rate-limited / validation cases — surface those verbatim. Anything else
  // (generic stream errors, upstream failures) gets the friendly fallback.
  const raw = error.message?.trim()
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { error?: string }
      if (parsed.error) return parsed.error
    } catch {
      // not our JSON shape — fall through to the generic fallback
    }
  }
  return ASK_FALLBACK_ERROR
}
