import { CornerDownLeft, ExternalLink, Search } from '@/components/PixelIcon'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

import type { GithubData } from '@/apps/github/types'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'

import { accentForeground } from './accent'
import { fuzzyMatch } from './fuzzy'
import { buildPaletteItems, type PaletteAction, type PaletteCategory, type PaletteItem } from './paletteItems'

const categoryOrder: PaletteCategory[] = ['app', 'section', 'repo']
const categoryHeading: Record<PaletteCategory, string> = {
  app: 'Apps',
  section: 'Jump to section',
  repo: 'GitHub repos',
}

type RankedItem = PaletteItem & { ranges: Array<[number, number]>; score: number }

// Split a string into highlighted / plain segments from matched ranges.
function highlight(text: string, ranges: Array<[number, number]>): ReactNode {
  if (!ranges.length) return text

  const nodes: ReactNode[] = []
  let cursor = 0

  ranges.forEach(([start, end], index) => {
    if (start > cursor) nodes.push(text.slice(cursor, start))
    nodes.push(
      <mark key={index} className="bg-coral/30 text-ink">
        {text.slice(start, end)}
      </mark>,
    )
    cursor = end
  })

  if (cursor < text.length) nodes.push(text.slice(cursor))

  return nodes
}

export function CommandPalette({
  githubData,
  onClose,
  onOpenSection,
  onOpenTarget,
  onOpenUrl,
}: {
  githubData: GithubData | null
  onClose: () => void
  onOpenSection: (action: Extract<PaletteAction, { kind: 'open-section' }>) => void
  onOpenTarget: (action: Extract<PaletteAction, { kind: 'open-app' }>) => void
  onOpenUrl: (url: string) => void
}) {
  const [query, setQuery] = useState('')
  const items = useMemo(() => buildPaletteItems(githubData), [githubData])

  const grouped = useMemo(() => {
    const ranked: RankedItem[] = []
    const hasQuery = query.trim().length > 0

    for (const item of items) {
      if (!hasQuery) {
        ranked.push({ ...item, ranges: [], score: 0 })
        continue
      }

      const match = fuzzyMatch(query, item.title, item.keywords)
      if (match) ranked.push({ ...item, ranges: match.ranges, score: match.score })
    }

    if (hasQuery) ranked.sort((a, b) => b.score - a.score)

    return categoryOrder
      .map((category) => ({
        category,
        items: ranked.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0)
  }, [items, query])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return

    event.preventDefault()
    onClose()
  }

  const runAction = (action: PaletteAction) => {
    if (action.kind === 'open-app') onOpenTarget(action)
    else if (action.kind === 'open-section') onOpenSection(action)
    else onOpenUrl(action.url)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2147483640] grid place-items-start justify-center bg-ink/30 px-4 pt-[14svh] max-[640px]:px-0 max-[640px]:pt-[8svh]"
      onPointerDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      role="presentation"
    >
      <motion.div
        className="w-[min(620px,calc(100vw_-_2rem))] overflow-hidden border-2 border-ink bg-foam shadow-window max-[640px]:w-full max-[640px]:border-x-0"
        onPointerDown={(event) => event.stopPropagation()}
        initial={{ y: -18, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -12, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
        role="dialog"
        aria-modal="true"
        aria-label="Search Felix's computer"
      >
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
          <div className="flex min-h-[3.35rem] items-center gap-3 border-b-2 border-ink px-4">
            <Search aria-hidden="true" className="text-ink" size={18} />
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search apps, sections, repos..."
            />
            <kbd className="inline-flex items-center border-2 border-ink bg-foam px-1.5 py-0.5 font-mono text-[0.62rem] font-bold leading-none text-ink">
              esc
            </kbd>
          </div>
          <CommandList aria-label="Search results">
            <CommandEmpty>
              <span className="font-display text-[0.74rem] uppercase tracking-[0.08em] text-ink-soft">
                Nothing found.
              </span>
            </CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group.category} heading={categoryHeading[group.category]}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isExternal = item.action.kind === 'open-url'

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      keywords={item.keywords}
                      onSelect={() => runAction(item.action)}
                    >
                      <span
                        className="grid size-[2.35rem] place-items-center border-2 border-ink shadow-chip"
                        style={
                          {
                            backgroundColor: item.accent,
                            color: accentForeground(item.accent),
                          } as CSSProperties
                        }
                      >
                        <Icon aria-hidden="true" size={19} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-display text-[0.78rem] font-normal uppercase tracking-[0.06em] text-ink">
                          {highlight(item.title, item.ranges)}
                        </span>
                        <span className="block truncate font-mono text-caption font-bold text-ink-soft">
                          {item.subtitle}
                        </span>
                      </span>
                      <CommandShortcut>
                        {isExternal ? (
                          <ExternalLink aria-hidden="true" size={12} />
                        ) : (
                          <CornerDownLeft aria-hidden="true" size={12} />
                        )}
                      </CommandShortcut>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </motion.div>
    </motion.div>
  )
}
