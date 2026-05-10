import {
  Activity,
  CircleDot,
  CircleHelp,
  FileText,
  Gauge,
  Github,
  Globe2,
  MonitorCog,
  Terminal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { AppId, NotesDocumentId } from './types'

type LaunchTarget = {
  app: AppId
  document?: NotesDocumentId
}

type AppCatalogItem = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  accent: string
  target: LaunchTarget
  terminalName: string
  terminalAliases?: readonly string[]
  desktop?: boolean
}

export type OpenableDesktopEntry = {
  name: string
  aliases: string[]
  app: AppId
  document?: NotesDocumentId
}

export const appCatalog: readonly AppCatalogItem[] = [
  {
    id: 'home',
    title: 'home.mdx',
    subtitle: 'Start here',
    icon: FileText,
    accent: '#f6c85f',
    target: { app: 'notes', document: 'home' },
    terminalName: 'home.mdx',
    terminalAliases: ['home', 'notes'],
  },
  {
    id: 'cv',
    title: 'cv.mdx',
    subtitle: 'Resume',
    icon: FileText,
    accent: '#8de5db',
    target: { app: 'notes', document: 'cv' },
    terminalName: 'cv.mdx',
    terminalAliases: ['cv', 'resume'],
  },
  {
    id: 'help',
    title: 'Help',
    subtitle: 'FelixOS guide',
    icon: CircleHelp,
    accent: '#7bc8ff',
    target: { app: 'help' },
    terminalName: 'help.app',
    terminalAliases: ['help', 'manual'],
    desktop: false,
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Stack map',
    icon: Gauge,
    accent: '#60d7cf',
    target: { app: 'skills' },
    terminalName: 'skills.app',
  },
  {
    id: 'browser',
    title: 'Browser',
    subtitle: 'Web search',
    icon: Globe2,
    accent: '#6f7cff',
    target: { app: 'browser' },
    terminalName: 'browser.app',
    terminalAliases: ['web', 'google', 'search'],
  },
  {
    id: 'github',
    title: 'GitHub',
    subtitle: 'Live data',
    icon: Github,
    accent: '#f0f3f6',
    target: { app: 'github' },
    terminalName: 'github.app',
    terminalAliases: ['git'],
  },
  {
    id: 'issues',
    title: 'Issues',
    subtitle: 'Project board',
    icon: CircleDot,
    accent: '#6f7cff',
    target: { app: 'issues' },
    terminalName: 'issues.app',
    terminalAliases: ['issue', 'tickets', 'board'],
  },
  {
    id: 'strava',
    title: 'Strava',
    subtitle: 'Live efforts',
    icon: Activity,
    accent: 'var(--color-strava)',
    target: { app: 'strava' },
    terminalName: 'strava.app',
    terminalAliases: ['rides'],
  },
  {
    id: 'terminal',
    title: 'Terminal',
    subtitle: 'Shell',
    icon: Terminal,
    accent: '#14262d',
    target: { app: 'terminal' },
    terminalName: 'terminal.app',
    terminalAliases: ['shell'],
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Desktop',
    icon: MonitorCog,
    accent: '#f6c85f',
    target: { app: 'settings' },
    terminalName: 'settings.app',
    terminalAliases: ['settings', 'preferences', 'desktop'],
    desktop: false,
  },
] as const

export const desktopApps = appCatalog.filter((app) => app.desktop !== false)

export const openableDesktopEntries: OpenableDesktopEntry[] = appCatalog.map((app) => ({
  name: app.terminalName,
  aliases: [
    app.id,
    app.title.toLowerCase(),
    ...(app.terminalAliases ?? []),
  ],
  app: app.target.app,
  document: app.target.document,
}))

export const dockApps = [
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'browser', label: 'Browser', icon: Globe2 },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'skills', label: 'Skills', icon: Gauge },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'issues', label: 'Issues', icon: CircleDot },
  { id: 'strava', label: 'Strava', icon: Activity },
] as const
