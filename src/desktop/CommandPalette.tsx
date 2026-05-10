import { CornerDownLeft, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'

import { appCatalog } from './apps'
import type { AppId, NotesDocumentId } from './types'

const commandItems = appCatalog.map((app) => ({
  ...app,
  target: app.target,
  keywords:
    app.id === 'home'
      ? ['home', 'home.mdx', 'notes', 'start', 'about']
      : app.id === 'cv'
        ? ['cv', 'cv.mdx', 'resume', 'curriculum vitae', 'notes']
        : [app.id, app.title, app.subtitle, `${app.id}.app`],
}))

export function CommandPalette({
  onClose,
  onOpenTarget,
}: {
  onClose: () => void
  onOpenTarget: (app: AppId, document?: NotesDocumentId) => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredItems = normalizedQuery
    ? commandItems.filter((item) =>
        item.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery)),
      )
    : commandItems

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const openItem = (index: number) => {
    const item = filteredItems[index]

    if (!item) return

    onOpenTarget(item.target.app, item.target.document)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, filteredItems.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      openItem(activeIndex)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2147483640] grid place-items-start justify-center bg-[rgba(20,38,45,0.22)] px-4 pt-[14svh] backdrop-blur-[6px]"
      onPointerDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      role="presentation"
    >
      <motion.div
        className="w-[min(620px,calc(100vw_-_2rem))] overflow-hidden rounded-window border border-os-border-strong bg-[rgba(250,252,247,0.96)] shadow-window backdrop-blur-[22px]"
        onPointerDown={(event) => event.stopPropagation()}
        initial={{ y: -18, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -12, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
        role="dialog"
        aria-modal="true"
        aria-label="Search Felix's computer"
      >
        <div className="flex min-h-[3.35rem] items-center gap-3 border-b border-os-border px-4">
          <Search aria-hidden="true" className="text-os-ink-soft" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-[0.98rem] font-extrabold text-os-ink outline-none placeholder:text-os-ink-soft"
            placeholder="Search apps and documents..."
            role="combobox"
            aria-expanded="true"
            aria-controls="felixos-command-list"
            aria-activedescendant={
              filteredItems[activeIndex] ? `felixos-command-${filteredItems[activeIndex].id}` : undefined
            }
          />
          <kbd className="rounded-[5px] border border-os-border bg-white/70 px-1.5 py-0.5 text-[0.62rem] font-black text-os-ink-soft">
            esc
          </kbd>
        </div>
        <div
          id="felixos-command-list"
          className="max-h-[min(420px,58svh)] overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
          {filteredItems.length ? (
            <div className="space-y-1">
              <p className="px-2.5 py-1 text-[0.66rem] font-black uppercase tracking-[0.12em] text-os-ink-soft">
                Open
              </p>
              {filteredItems.map((item, index) => {
                const Icon = item.icon
                const isActive = index === activeIndex

                return (
                  <button
                    key={item.id}
                    id={`felixos-command-${item.id}`}
                    type="button"
                    className={`grid w-full cursor-pointer grid-cols-[2.45rem_1fr_auto] items-center gap-3 rounded-card border px-2.5 py-2.5 text-left font-[inherit] transition ${
                      isActive
                        ? 'border-os-border-strong bg-white/82 shadow-chip'
                        : 'border-transparent bg-transparent hover:border-os-border hover:bg-white/58'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openItem(index)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <span
                      className="grid size-[2.35rem] place-items-center rounded-[10px] border border-white/55 bg-[image:var(--desktop-tile-bg)] shadow-desktop-tile"
                      style={{ '--accent': item.accent } as CSSProperties}
                    >
                      <Icon aria-hidden="true" size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-window font-black text-os-ink">
                        {item.title}
                      </span>
                      <span className="block truncate text-caption font-extrabold text-os-ink-soft">
                        {item.target.app === 'notes'
                          ? `Open ${item.target.document}.mdx in notes.app`
                          : `Open ${item.title.toLowerCase()}.app`}
                      </span>
                    </span>
                    {isActive ? (
                      <span className="flex items-center gap-1 rounded-[6px] border border-os-border bg-white/72 px-1.5 py-1 text-[0.62rem] font-black text-os-ink-soft">
                        <CornerDownLeft aria-hidden="true" size={12} />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid min-h-[8rem] place-items-center px-4 text-center text-window font-extrabold text-os-ink-soft">
              No apps or documents found.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
