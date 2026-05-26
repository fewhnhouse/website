import type { CSSProperties } from 'react'

import { desktopApps } from './apps'
import type { AppId, NotesDocumentId } from './types'

// Whole-shortcut button: just a transparent click target. No background,
// no border, no transitions of its own.
const desktopIconClass =
  'group/desktop-icon grid w-desktop-icon cursor-pointer appearance-none justify-items-center gap-2 border-0 bg-transparent p-1 text-center font-[inherit] text-[var(--desktop-icon-fg)] outline-none focus-visible:outline-none max-[720px]:w-[74px]'

// The icon "chip" — 2px ink border + 3px ink shadow-stack on the per-app
// accent color. Hover state is paint-only: a dashed coral `outline` (which
// doesn't reflow or animate the tile's geometry, so no flicker). Press
// instantly snaps the tile into its shadow — no transition, just the
// canonical chunky pixel-UI feel.
const desktopIconTileClass =
  'relative grid size-desktop-tile place-items-center border-2 border-ink text-ink shadow-desktop-tile outline-2 outline-dashed outline-transparent outline-offset-[3px] group-hover/desktop-icon:outline-lagoon-deep group-focus-visible/desktop-icon:outline-lagoon-deep group-active/desktop-icon:translate-x-[2px] group-active/desktop-icon:translate-y-[2px] group-active/desktop-icon:shadow-none max-[720px]:size-12'

const desktopIconLabelClass =
  'max-w-[88px] overflow-hidden text-ellipsis whitespace-nowrap font-display text-[0.7rem] font-normal uppercase leading-tight tracking-[0.08em] text-[var(--desktop-icon-fg)]'

const desktopIconSubtitleClass =
  'text-[0.64rem] font-bold tracking-[0.02em] text-[var(--desktop-icon-muted)]'

type DesktopShortcutsProps = {
  onOpenTarget: (app: AppId, document?: NotesDocumentId) => void
}

export function DesktopShortcuts({ onOpenTarget }: DesktopShortcutsProps) {
  return (
    <section
      className="relative z-[2] grid w-max grid-cols-[repeat(2,86px)] gap-4 p-5 max-[720px]:grid-cols-[repeat(4,74px)] max-[720px]:gap-2 max-[720px]:px-2 max-[720px]:py-3.5"
      aria-label="Desktop shortcuts"
    >
      {desktopApps.map((app) => {
        const Icon = app.icon

        return (
          <button
            key={app.id}
            type="button"
            className={desktopIconClass}
            onClick={() => onOpenTarget(app.target.app, app.target.document)}
            aria-label={`Open ${app.title}`}
          >
            <span
              className={desktopIconTileClass}
              style={
                {
                  backgroundColor: app.accent,
                  color: isDarkAccent(app.accent) ? '#FAF9F5' : '#1F1E1D',
                } as CSSProperties
              }
            >
              <Icon aria-hidden="true" size={32} />
            </span>
            <span className="grid gap-0.5">
              <span className={desktopIconLabelClass}>{app.title}</span>
              <small className={desktopIconSubtitleClass}>{app.subtitle}</small>
            </span>
          </button>
        )
      })}
    </section>
  )
}

// Tiles use a per-app accent fill; flip the icon to cream on dark accents
// (ink / terminal) so the silhouette stays readable.
function isDarkAccent(accent: string) {
  return accent.toLowerCase() === '#1f1e1d' || accent.toLowerCase() === '#14262d'
}
