// Per-app accent tiles use a fixed (theme-independent) accent fill, so their
// foreground (icon + glyph) must be chosen from the accent's own luminance —
// not the active theme. Picking the higher-contrast of ink vs. paper means a
// saturated/dark accent like the violet primary gets a light foreground
// (near-black fails contrast on saturated violet), while light accents
// (violet-soft, plum-soft, gold, amber) keep the dark ink glyph.

const INK = '#1F1E1D' // --ink / --color-os-ink (fixed)
const PAPER = '#F6F4EC' // --foam / ink-inverse (fixed)

function channelLuminance(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const n = Number.parseInt(match[1], 16)
  const r = channelLuminance((n >> 16) & 0xff)
  const g = channelLuminance((n >> 8) & 0xff)
  const b = channelLuminance(n & 0xff)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const INK_LUMINANCE = relativeLuminance(INK) ?? 0
const PAPER_LUMINANCE = relativeLuminance(PAPER) ?? 1

/**
 * Returns the readable foreground color (ink or paper) for an accent fill.
 * Non-hex accents (e.g. a raw CSS var) fall back to ink, suiting light fills.
 */
export function accentForeground(accent: string): string {
  const luminance = relativeLuminance(accent)
  if (luminance === null) return INK
  return contrastRatio(luminance, PAPER_LUMINANCE) >= contrastRatio(luminance, INK_LUMINANCE)
    ? PAPER
    : INK
}
