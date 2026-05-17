import type { CSSProperties } from 'react'

import { desktopApps } from './apps'
import type { AppId, NotesDocumentId } from './types'

const desktopIconClass =
  'grid min-h-[94px] w-desktop-icon cursor-pointer appearance-none justify-items-center gap-1 rounded-[10px] border border-transparent bg-transparent text-center font-[inherit] text-[var(--desktop-icon-fg)] hover:border-white/45 hover:bg-white/20 focus-visible:border-white/45 focus-visible:bg-white/20 focus-visible:outline-none max-[720px]:w-[74px]'
const desktopIconTileClass =
  'grid size-desktop-tile place-items-center rounded-icon border border-white/50 bg-[image:var(--desktop-tile-bg)] text-[var(--desktop-tile-fg)] shadow-desktop-tile max-[720px]:size-12 max-[720px]:rounded-[14px]'

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
              style={{ '--accent': app.accent } as CSSProperties}
            >
              <Icon aria-hidden="true" size={28} />
            </span>
            <span className="max-w-[82px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.76rem] font-black leading-tight text-[var(--desktop-icon-fg)]">
              {app.title}
            </span>
            <small className="text-[0.64rem] font-extrabold text-[var(--desktop-icon-muted)]">
              {app.subtitle}
            </small>
          </button>
        )
      })}
    </section>
  )
}
