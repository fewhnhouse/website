import { Activity, Bike, Code2, FileText, Github, MountainSnow, Server, Terminal } from 'lucide-react'

export const desktopApps = [
  {
    id: 'home',
    title: 'home.mdx',
    subtitle: 'Start here',
    icon: FileText,
    accent: '#f6c85f',
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Coming soon',
    icon: Code2,
    accent: '#60d7cf',
  },
  {
    id: 'infra',
    title: 'Infra',
    subtitle: 'Coming soon',
    icon: Server,
    accent: '#8de5db',
  },
  {
    id: 'outside',
    title: 'Outside',
    subtitle: 'Coming soon',
    icon: MountainSnow,
    accent: '#f07f5a',
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
] as const

export const dockApps = [
  { id: 'home', label: 'Editor', icon: FileText },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'rides', label: 'Routes', icon: Bike },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'strava', label: 'Strava', icon: Activity },
] as const
