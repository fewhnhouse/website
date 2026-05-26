export const osAppShellClass =
  'os-app-shell flex min-h-0 flex-1 flex-col text-os-ink [max-height:calc(min(var(--os-app-max-height),calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:max-h-none'

export const osAppHeight = {
  compact: '[--os-app-max-height:620px]',
  default: '[--os-app-max-height:700px]',
  tall: '[--os-app-max-height:720px]',
  xl: '[--os-app-max-height:880px]',
} as const

// Thin wrappers around the .os-* utility classes defined in styles.css.
// Components import these names so the design system stays the single
// source of truth — never hand-roll button/panel/input styles per app.
export const osPanelClass = 'os-panel'
export const osPanelBareClass = 'os-panel--bare'
export const osPanelSunkenClass = 'os-panel--sunken'
export const osInputClass = 'os-input'

export const osBtnClass = 'os-btn'
export const osBtnPrimaryClass = 'os-btn os-btn--primary'
export const osBtnSecondaryClass = 'os-btn os-btn--secondary'
export const osBtnGhostClass = 'os-btn os-btn--ghost'
export const osBtnSmClass = 'os-btn os-btn--sm'
export const osBtnIconClass = 'os-btn os-btn--icon'

export const osChipClass = 'os-chip'
export const osScrollClass = 'os-scroll'

// Toolbar buttons (small ghost-style controls) — used by the Notes
// toolbar segment and similar inline strips.
export const osToolbarButtonClass = 'os-btn os-btn--sm os-btn--ghost'
export const osToolbarButtonActiveClass =
  '!bg-lagoon !text-foam !shadow-[2px_2px_0_0_var(--line)]'
