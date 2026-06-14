import type { GithubData, GithubRepo } from '@/apps/github/types'
import { initialNotesMarkdown } from '@/apps/notes/notesMarkdown'
import type { PixelIconComponent } from '@/components/PixelIcon'
import { FileText, Github as GithubIcon, Star } from '@/components/PixelIcon'

import { appCatalog } from './apps'
import type { AppId, NotesDocumentId } from './types'

export type PaletteCategory = 'app' | 'section' | 'repo'

export type PaletteAction =
  | { kind: 'open-app'; app: AppId; document?: NotesDocumentId }
  | { kind: 'open-section'; document: NotesDocumentId; sectionId: string }
  | { kind: 'open-url'; url: string }

export type PaletteItem = {
  id: string
  category: PaletteCategory
  title: string
  subtitle: string
  icon: PixelIconComponent
  accent: string
  keywords: string[]
  action: PaletteAction
}

const sectionAccent = '#F4D9CB'
const repoAccent = '#1F1E1D'

// Slugify a heading the same way RenderedMarkdown assigns heading ids, so the
// palette can scroll an open Notes document to the matching section.
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const appItems: PaletteItem[] = appCatalog.map((app) => ({
  id: `app:${app.id}`,
  category: 'app',
  title: app.title,
  subtitle: app.subtitle,
  icon: app.icon,
  accent: app.accent,
  keywords: [
    app.id,
    app.title,
    app.subtitle,
    app.terminalName,
    ...(app.terminalAliases ?? []),
  ],
  action:
    app.target.app === 'notes'
      ? { kind: 'open-app', app: 'notes', document: app.target.document }
      : { kind: 'open-app', app: app.target.app },
}))

type HeadingMatch = { level: number; text: string }

function extractHeadings(markdown: string): HeadingMatch[] {
  const headings: HeadingMatch[] = []

  for (const rawLine of markdown.split('\n')) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(rawLine.trim())
    if (!match) continue
    headings.push({ level: match[1].length, text: stripInline(match[2]) })
  }

  return headings
}

// Headings can contain inline markdown (code/emphasis/links). Strip the syntax
// so palette labels read cleanly.
function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim()
}

function sectionItems(document: NotesDocumentId, label: string): PaletteItem[] {
  const seen = new Set<string>()
  const items: PaletteItem[] = []

  for (const heading of extractHeadings(initialNotesMarkdown[document])) {
    if (heading.level < 2 || heading.level > 3) continue

    const sectionId = slugifyHeading(heading.text)
    if (!sectionId || seen.has(sectionId)) continue
    seen.add(sectionId)

    items.push({
      id: `section:${document}:${sectionId}`,
      category: 'section',
      title: heading.text,
      subtitle: `${label} → ${heading.text}`,
      icon: FileText,
      accent: sectionAccent,
      keywords: [heading.text, document, label, `${document}.mdx`],
      action: { kind: 'open-section', document, sectionId },
    })
  }

  return items
}

function repoItems(githubData: GithubData | null): PaletteItem[] {
  if (!githubData) return []

  const seen = new Set<string>()
  const items: PaletteItem[] = []

  const pushRepo = (repo: GithubRepo, starred: boolean) => {
    if (seen.has(repo.full_name)) return
    seen.add(repo.full_name)

    items.push({
      id: `repo:${repo.full_name}`,
      category: 'repo',
      title: repo.name,
      subtitle: repo.description?.trim() || repo.full_name,
      icon: starred ? Star : GithubIcon,
      accent: repoAccent,
      keywords: [
        repo.name,
        repo.full_name,
        repo.language ?? '',
        repo.description ?? '',
      ],
      action: { kind: 'open-url', url: repo.html_url },
    })
  }

  for (const repo of githubData.recentRepos) pushRepo(repo, false)
  for (const repo of githubData.starredRepos) pushRepo(repo, true)

  return items
}

export function buildPaletteItems(githubData: GithubData | null): PaletteItem[] {
  return [
    ...appItems,
    ...sectionItems('home', 'home.mdx'),
    ...sectionItems('cv', 'cv.mdx'),
    ...repoItems(githubData),
  ]
}
