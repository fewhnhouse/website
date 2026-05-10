import { CornerDownLeft, Search } from 'lucide-react'
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
        <Command onKeyDown={handleKeyDown}>
          <div className="flex min-h-[3.35rem] items-center gap-3 border-b border-os-border px-4">
            <Search aria-hidden="true" className="text-os-ink-soft" size={18} />
            <CommandInput autoFocus placeholder="Search apps and documents..." />
            <kbd className="rounded-[5px] border border-os-border bg-white/70 px-1.5 py-0.5 text-[0.62rem] font-black text-os-ink-soft">
              esc
            </kbd>
          </div>
          <CommandList aria-label="Search results">
            <CommandEmpty>No apps or documents found.</CommandEmpty>
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
