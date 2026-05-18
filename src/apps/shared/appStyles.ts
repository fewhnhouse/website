export const osAppShellClass =
  'os-app-shell flex min-h-0 flex-1 flex-col text-os-ink [max-height:calc(min(var(--os-app-max-height),calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:max-h-none'

export const osAppHeight = {
  compact: '[--os-app-max-height:620px]',
  default: '[--os-app-max-height:700px]',
  tall: '[--os-app-max-height:720px]',
  xl: '[--os-app-max-height:880px]',
} as const

export const osPanelClass = 'rounded-card border border-os-border bg-white/62 p-4 shadow-chip'
export const osPanelBareClass = 'rounded-card border border-os-border bg-white/68 shadow-chip'

export const osToolbarButtonClass =
  'cursor-pointer rounded-control border border-os-border bg-white/65 px-2.5 py-1.5 text-caption font-black text-os-ink-muted hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-default disabled:opacity-55'

export const osToolbarButtonActiveClass =
  'border-[#2c4a55]/70 bg-[#2c4a55] text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] hover:!bg-[#365764]'

export const osInputClass =
  'w-full rounded-card border border-os-border bg-white/78 px-3 py-2 text-sm font-bold text-os-ink outline-none transition placeholder:text-os-ink-soft focus:border-ring focus:bg-white focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-55'
