import { CornerDownLeft, Search } from '@/components/PixelIcon'
import { motion } from 'motion/react'
import type { CSSProperties, KeyboardEvent } from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'

import { appCatalog } from './apps'
import type { AppId, NotesDocumentId } from './types'

function isDarkAccent(accent: string) {
  return accent.toLowerCase() === '#1f1e1d' || accent.toLowerCase() === '#14262d'
}

const commandItems = appCatalog.map((app) => ({
  ...app,
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
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return

    event.preventDefault()
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2147483640] grid place-items-start justify-center bg-ink/30 px-4 pt-[14svh]"
      onPointerDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      role="presentation"
    >
      <motion.div
        className="w-[min(620px,calc(100vw_-_2rem))] overflow-hidden border-2 border-ink bg-foam shadow-window"
        onPointerDown={(event) => event.stopPropagation()}
        initial={{ y: -18, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -12, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
        role="dialog"
        aria-modal="true"
        aria-label="Search Felix's computer"
      >
        <Command onKeyDown={handleKeyDown}>
          <div className="flex min-h-[3.35rem] items-center gap-3 border-b-2 border-ink px-4">
            <Search aria-hidden="true" className="text-ink" size={18} />
            <CommandInput autoFocus placeholder="Search apps and documents..." />
            <kbd className="inline-flex items-center border-2 border-ink bg-foam px-1.5 py-0.5 font-mono text-[0.62rem] font-bold leading-none text-ink">
              esc
            </kbd>
          </div>
          <CommandList aria-label="Search results">
            <CommandEmpty>
              <span className="font-display text-[0.74rem] uppercase tracking-[0.08em] text-ink-soft">
                No apps or documents found.
              </span>
            </CommandEmpty>
            <CommandGroup heading="Open">
              {commandItems.map((item) => {
                const Icon = item.icon

                return (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    keywords={item.keywords}
                    onSelect={() => onOpenTarget(item.target.app, item.target.document)}
                  >
                    <span
                      className="grid size-[2.35rem] place-items-center border-2 border-ink shadow-chip"
                      style={
                        {
                          backgroundColor: item.accent,
                          color: isDarkAccent(item.accent) ? '#FAF9F5' : '#1F1E1D',
                        } as CSSProperties
                      }
                    >
                      <Icon aria-hidden="true" size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[0.78rem] font-normal uppercase tracking-[0.06em] text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate font-mono text-caption font-bold text-ink-soft">
                        {item.target.app === 'notes'
                          ? `~/notes/${item.target.document}.mdx`
                          : `${item.id}.app`}
                      </span>
                    </span>
                    <CommandShortcut>
                      <CornerDownLeft aria-hidden="true" size={12} />
                    </CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </motion.div>
    </motion.div>
  )
}
