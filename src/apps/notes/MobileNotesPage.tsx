import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import type { NotesDocumentId } from '@/desktop/types'

import { initialNotesMarkdown } from './documents'

type MobileNotesPageProps = {
  document: NotesDocumentId
}

export function MobileNotesPage({ document }: MobileNotesPageProps) {
  const markdown = initialNotesMarkdown[document]

  return (
    <main className="min-h-[100svh] bg-foam text-os-ink">
      <header className="sticky top-0 z-10 border-b border-os-border bg-foam/92 px-4 py-3 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-2xl items-center justify-between gap-3" aria-label="Mobile documents">
          <Link
            to="/home"
            className="flex min-w-0 items-center gap-2 text-os-ink no-underline"
            activeProps={{ 'aria-current': 'page' }}
          >
            <img
              className="size-8 rounded-full border border-white/80 object-cover object-[50%_31%] shadow-os-logo"
              src="/felix-portrait.jpg"
              alt=""
              aria-hidden="true"
            />
            <span className="truncate font-black">home.mdx</span>
          </Link>
          <Link
            to="/cv"
            className="shrink-0 rounded-control border border-os-border bg-white/65 px-3 py-1.5 text-caption font-black text-lagoon-deep no-underline"
            activeProps={{ 'aria-current': 'page' }}
          >
            cv.mdx
          </Link>
        </nav>
      </header>

      <article className="felix-mobile-mdx felix-mdx-content mx-auto max-w-2xl px-5 pt-6 pb-10">
        {renderMobileMarkdown(markdown)}
      </article>
    </main>
  )
}

function renderMobileMarkdown(markdown: string) {
  const lines = markdown.trim().split('\n')
  const blocks: ReactNode[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()

    if (!line) continue

    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line)
    if (image) {
      blocks.push(<img key={index} src={image[2]} alt={image[1]} />)
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push(<h3 key={index}>{renderInlineMarkdown(line.slice(4))}</h3>)
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push(<h2 key={index}>{renderInlineMarkdown(line.slice(3))}</h2>)
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push(<h1 key={index}>{renderInlineMarkdown(line.slice(2))}</h1>)
      continue
    }

    if (line.startsWith('- ')) {
      const items: ReactNode[] = []

      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(<li key={index}>{renderInlineMarkdown(lines[index].trim().slice(2))}</li>)
        index += 1
      }

      index -= 1
      blocks.push(<ul key={`list-${index}`}>{items}</ul>)
      continue
    }

    const paragraph = [line]

    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim()

      if (!nextLine || /^#{1,3} /.test(nextLine) || nextLine.startsWith('- ') || nextLine.startsWith('![')) {
        break
      }

      paragraph.push(nextLine)
      index += 1
    }

    blocks.push(<p key={index}>{renderInlineMarkdown(paragraph.join(' '))}</p>)
  }

  return blocks
}

function renderInlineMarkdown(text: string) {
  const parts: ReactNode[] = []
  const pattern = /\[(`[^`]+`|[^\]]+)\]\(([^)]+)\)|`([^`]+)`/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index))
    }

    if (match[1] && match[2]) {
      const label = match[1].startsWith('`') ? <code>{match[1].slice(1, -1)}</code> : match[1]

      parts.push(
        <Link key={`${match.index}-${match[2]}`} to={match[2]}>
          {label}
        </Link>,
      )
    } else if (match[3]) {
      parts.push(<code key={`${match.index}-${match[3]}`}>{match[3]}</code>)
    }

    cursor = pattern.lastIndex
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts
}
