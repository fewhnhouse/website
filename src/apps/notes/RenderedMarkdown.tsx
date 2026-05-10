import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type RenderedMarkdownProps = {
  className?: string
  markdown: string
}

export function RenderedMarkdown({ className, markdown }: RenderedMarkdownProps) {
  return <div className={className}>{renderMarkdownBlocks(markdown)}</div>
}

function renderMarkdownBlocks(markdown: string) {
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
