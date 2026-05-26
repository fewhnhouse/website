import type { ComponentType, SVGProps } from 'react'

// Pixel-art icon set sourced from `pixelarticons` (https://pixelarticons.com/).
// 486 hand-drawn 24×24 icons, MIT-licensed. Tree-shakeable per-icon imports
// keep the bundle small.
//
// Two custom additions (`GithubMark`, `LinkedinMark`) cover brand marks that
// aren't in the pixelarticons set — drawn as pixel paths on the same 24×24
// grid so they sit visually next to the library set.
//
// Named exports mirror lucide-react's API: pass `size`, `className`,
// `aria-hidden` etc. and the underlying SVG receives them as standard
// attributes. This means call sites only ever needed to swap the import path.

// Per-icon imports (not the barrel). The package's `react/index.js` uses
// extension-less re-exports that aren't ESM-resolvable, so importing from
// the root path breaks Vite's dev SSR runtime. Importing each icon by
// path is what the upstream docs recommend anyway — tree-shakeable and
// dev-server safe.
import { AppWindows } from 'pixelarticons/react/AppWindows'
import { ArrowLeft as PaArrowLeft } from 'pixelarticons/react/ArrowLeft'
import { ArrowRight as PaArrowRight } from 'pixelarticons/react/ArrowRight'
import { Article } from 'pixelarticons/react/Article'
import { AudioWaveform } from 'pixelarticons/react/AudioWaveform'
import { Battery as PaBattery } from 'pixelarticons/react/Battery'
import { Box as PaBox } from 'pixelarticons/react/Box'
import { Braces } from 'pixelarticons/react/Braces'
import { Check as PaCheck } from 'pixelarticons/react/Check'
import { CheckDouble } from 'pixelarticons/react/CheckDouble'
import { Circle } from 'pixelarticons/react/Circle'
import { Clock as PaClock } from 'pixelarticons/react/Clock'
import { Cloud as PaCloud } from 'pixelarticons/react/Cloud'
import { CornerDownLeft as PaCornerDownLeft } from 'pixelarticons/react/CornerDownLeft'
import { Cpu as PaCpu } from 'pixelarticons/react/Cpu'
import { Download as PaDownload } from 'pixelarticons/react/Download'
import { ExternalLink as PaExternalLink } from 'pixelarticons/react/ExternalLink'
import { Fire } from 'pixelarticons/react/Fire'
import { Gamepad as PaGamepad } from 'pixelarticons/react/Gamepad'
import { GitBranch } from 'pixelarticons/react/GitBranch'
import { GitPullRequest } from 'pixelarticons/react/GitPullRequest'
import { Globe as PaGlobe } from 'pixelarticons/react/Globe'
import { Image as PaImage } from 'pixelarticons/react/Image'
import { InfoBox } from 'pixelarticons/react/InfoBox'
import { Lock as PaLock } from 'pixelarticons/react/Lock'
import { Mail as PaMail } from 'pixelarticons/react/Mail'
import { MapPin as PaMapPin } from 'pixelarticons/react/MapPin'
import { Monitor } from 'pixelarticons/react/Monitor'
import { Play as PaPlay } from 'pixelarticons/react/Play'
import { Plus as PaPlus } from 'pixelarticons/react/Plus'
import { Pointer } from 'pixelarticons/react/Pointer'
import { Reload } from 'pixelarticons/react/Reload'
import { Search as PaSearch } from 'pixelarticons/react/Search'
import { SpeedFast } from 'pixelarticons/react/SpeedFast'
import { SpeedMedium } from 'pixelarticons/react/SpeedMedium'
import { Star as PaStar } from 'pixelarticons/react/Star'
import { Terminal as PaTerminal } from 'pixelarticons/react/Terminal'
import { Trophy as PaTrophy } from 'pixelarticons/react/Trophy'
import { WarningDiamond } from 'pixelarticons/react/WarningDiamond'
import { Wifi as PaWifi } from 'pixelarticons/react/Wifi'

type PixelIconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  size?: number | string
}

// Wraps a pixelarticons component with our defaults (16px, crisp edges,
// currentColor). All props pass through, so size/className/aria-hidden etc.
// behave exactly like lucide-react icons.
function wrap(Source: ComponentType<SVGProps<SVGSVGElement>>, displayName: string) {
  function Icon({ size = 16, ...rest }: PixelIconProps) {
    return (
      <Source
        width={size}
        height={size}
        shapeRendering="crispEdges"
        focusable="false"
        {...rest}
      />
    )
  }
  Icon.displayName = displayName
  return Icon
}

// ── Custom marks (not in pixelarticons) ─────────────────────────────
// Drawn on the same 24×24 grid for visual continuity with the library.

// Paths copied verbatim from pixelarticons.com's pro icon previews
// (https://pixelarticons.com/icon/github/ and /icon/linkedin/) — same
// 24×24 grid the rest of the set uses, so they sit visually flush next
// to the free icons.
function GithubMark({ size = 16, ...rest }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      shapeRendering="crispEdges"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z" />
    </svg>
  )
}
GithubMark.displayName = 'GithubMark'

function LinkedinMark({ size = 16, ...rest }: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      shapeRendering="crispEdges"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d="M7 22H1V8h6v14Zm12-12h-8v10h2v-8h4v2h-2v8H9V8h10v2Zm4 12h-6v-8h2v6h2v-8h2v10ZM3 20h2V10H3v10Zm18-8h-2v-2h2v2ZM5 7H3V5h2v2ZM3 5H1V3h2v2Zm4 0H5V3h2v2ZM5 3H3V1h2v2Z" />
    </svg>
  )
}
LinkedinMark.displayName = 'LinkedinMark'

// ── Named exports — mirror lucide-react's API surface ──────────────
export const Activity = wrap(AudioWaveform, 'Activity')
export const AlertCircle = wrap(WarningDiamond, 'AlertCircle')
export const AlertTriangle = wrap(WarningDiamond, 'AlertTriangle')
export const AppWindow = wrap(AppWindows, 'AppWindow')
export const ArrowLeft = wrap(PaArrowLeft, 'ArrowLeft')
export const ArrowRight = wrap(PaArrowRight, 'ArrowRight')
export const Battery = wrap(PaBattery, 'Battery')
export const Bike = wrap(SpeedFast, 'Bike')
export const Check = wrap(PaCheck, 'Check')
export const CheckCircle2 = wrap(CheckDouble, 'CheckCircle2')
export const CircleDot = wrap(Circle, 'CircleDot')
export const CircleHelp = wrap(InfoBox, 'CircleHelp')
export const Clock3 = wrap(PaClock, 'Clock3')
export const Cloud = wrap(PaCloud, 'Cloud')
export const Code2 = wrap(Braces, 'Code2')
export const Container = wrap(PaBox, 'Container')
export const CornerDownLeft = wrap(PaCornerDownLeft, 'CornerDownLeft')
export const Cpu = wrap(PaCpu, 'Cpu')
export const Download = wrap(PaDownload, 'Download')
export const ExternalLink = wrap(PaExternalLink, 'ExternalLink')
export const FileText = wrap(Article, 'FileText')
export const Flame = wrap(Fire, 'Flame')
export const Gamepad2 = wrap(PaGamepad, 'Gamepad2')
export const Gauge = wrap(SpeedMedium, 'Gauge')
export const GitFork = wrap(GitBranch, 'GitFork')
export const GitPullRequestDraft = wrap(GitPullRequest, 'GitPullRequestDraft')
export const Github = GithubMark
export const Globe = wrap(PaGlobe, 'Globe')
export const Globe2 = wrap(PaGlobe, 'Globe2')
export const Image = wrap(PaImage, 'Image')
export const Linkedin = LinkedinMark
export const Lock = wrap(PaLock, 'Lock')
export const Mail = wrap(PaMail, 'Mail')
export const MapPin = wrap(PaMapPin, 'MapPin')
export const MapPinned = wrap(PaMapPin, 'MapPinned')
export const MonitorCog = wrap(Monitor, 'MonitorCog')
export const MousePointer2 = wrap(Pointer, 'MousePointer2')
export const Play = wrap(PaPlay, 'Play')
export const Plus = wrap(PaPlus, 'Plus')
export const RefreshCw = wrap(Reload, 'RefreshCw')
export const RotateCw = wrap(Reload, 'RotateCw')
export const Search = wrap(PaSearch, 'Search')
export const Star = wrap(PaStar, 'Star')
export const Terminal = wrap(PaTerminal, 'Terminal')
export const TerminalSquare = wrap(PaTerminal, 'TerminalSquare')
export const Trophy = wrap(PaTrophy, 'Trophy')
export const Wifi = wrap(PaWifi, 'Wifi')

export type PixelIconComponent = ComponentType<PixelIconProps>
