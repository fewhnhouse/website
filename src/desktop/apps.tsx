import { Activity, FileText, Gauge, Github, Terminal } from 'lucide-react'

export const desktopApps = [
  {
    id: 'home',
    title: 'home.mdx',
    subtitle: 'Start here',
    icon: FileText,
    accent: '#f6c85f',
  },
  {
    id: 'cv',
    title: 'cv.mdx',
    subtitle: 'Resume',
    icon: FileText,
    accent: '#8de5db',
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Stack map',
    icon: Gauge,
    accent: '#60d7cf',
  },
  {
    id: 'github',
    title: 'GitHub',
    subtitle: 'Live data',
    icon: Github,
    accent: '#f0f3f6',
  },
  {
    id: 'strava',
    title: 'Strava',
    subtitle: 'Live efforts',
    icon: Activity,
    accent: 'var(--color-strava)',
  },
  {
    id: 'terminal',
    title: 'Terminal',
    subtitle: 'Shell',
    icon: Terminal,
    accent: '#14262d',
  },
] as const

export const dockApps = [
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'skills', label: 'Skills', icon: Gauge },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'strava', label: 'Strava', icon: Activity },
] as const
