import { Link } from '@tanstack/react-router'
import { Github, Globe, Linkedin, Mail, MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ReactNode } from 'react'

type RenderedMarkdownProps = {
  className?: string
  markdown: string
}

type ProfileHeaderProps = {
  description?: string
  image?: string
  location?: string
  name?: string
  role?: string
}

type CvHeaderProps = {
  email?: string
  github?: string
  linkedin?: string
  location?: string
  name?: string
  role?: string
  website?: string
}

export function RenderedMarkdown({ className, markdown }: RenderedMarkdownProps) {
  return <div className={className}>{renderMarkdownBlocks(markdown)}</div>
}

function renderMarkdownBlocks(markdown: string) {
  const lines = trimBlankEdges(normalizeEditedMarkdown(markdown).split('\n'))
  const blocks: ReactNode[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()

    if (!line) {
      const blankLineCount = countBlankLines(lines, index)
      const hasContentBefore = blocks.length > 0
      const hasContentAfter = index + blankLineCount < lines.length

      if (hasContentBefore && hasContentAfter) {
        blocks.push(
          <div
            key={`blank-lines-${index}`}
            aria-hidden="true"
            className="felix-mdx-blank-lines"
            style={{ '--blank-lines': blankLineCount } as CSSProperties}
          />,
        )
      }

      index += blankLineCount - 1
      continue
    }

    if (line.startsWith('<ProfileHeader')) {
      const componentLines = [line]

      while (!lines[index].trim().endsWith('/>') && index + 1 < lines.length) {
        index += 1
        componentLines.push(lines[index].trim())
      }

      blocks.push(<ProfileHeader key={index} {...parseProfileHeaderProps(componentLines.join(' '))} />)
      continue
    }

    if (line.startsWith('<CvHeader')) {
      const componentLines = [line]

      while (!lines[index].trim().endsWith('/>') && index + 1 < lines.length) {
        index += 1
        componentLines.push(lines[index].trim())
      }

      blocks.push(<CvHeader key={index} {...parseCvHeaderProps(componentLines.join(' '))} />)
      continue
    }

    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line)
    if (image) {
      blocks.push(<img key={index} src={image[2]} alt={image[1]} />)
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) {
      blocks.push(renderHeading(index, heading[1].length, heading[2]))
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

      if (!nextLine || /^#{1,6}\s+/.test(nextLine) || nextLine.startsWith('- ') || nextLine.startsWith('![')) {
        break
      }

      paragraph.push(nextLine)
      index += 1
    }

    blocks.push(<p key={index}>{renderParagraphLines(paragraph)}</p>)
  }

  return blocks
}

function trimBlankEdges(lines: Array<string>) {
  let start = 0
  let end = lines.length

  while (start < end && !lines[start].trim()) start += 1
  while (end > start && !lines[end - 1].trim()) end -= 1

  return lines.slice(start, end)
}

function countBlankLines(lines: Array<string>, startIndex: number) {
  let count = 0

  while (startIndex + count < lines.length && !lines[startIndex + count].trim()) {
    count += 1
  }

  return count
}

function normalizeEditedMarkdown(markdown: string) {
  return markdown
    .replace(/(^|\n)\\(#{1,6}\s+)/g, '$1$2')
    .replace(/(^|\n)\\(-\s+)/g, '$1$2')
    .replace(/\\([*_`[\]()])/g, '$1')
}

function parseProfileHeaderProps(source: string): ProfileHeaderProps {
  const props: ProfileHeaderProps = {}
  const attributePattern = /(image|name|description|role|location)="([^"]*)"/g
  let match: RegExpExecArray | null

  while ((match = attributePattern.exec(source))) {
    props[match[1] as keyof ProfileHeaderProps] = match[2]
  }

  return props
}

function parseCvHeaderProps(source: string): CvHeaderProps {
  const props: CvHeaderProps = {}
  const attributePattern = /(name|role|location|email|website|linkedin|github)="([^"]*)"/g
  let match: RegExpExecArray | null

  while ((match = attributePattern.exec(source))) {
    props[match[1] as keyof CvHeaderProps] = match[2]
  }

  return props
}

function CvHeader({
  email = '',
  github = '',
  linkedin = '',
  location = '',
  name = 'Felix Wohnhaas',
  role = '',
  website = '',
}: CvHeaderProps) {
  const links = [
    website ? { href: website, icon: Globe, label: 'Website' } : null,
    linkedin ? { href: linkedin, icon: Linkedin, label: 'LinkedIn' } : null,
    github ? { href: github, icon: Github, label: 'GitHub' } : null,
  ].filter((link): link is { href: string; icon: typeof Globe; label: string } => link !== null)

  return (
    <header className="felix-cv-header" aria-label={`${name} curriculum vitae`}>
      <p className="felix-cv-header__label">Curriculum vitae</p>
      <h1 className="felix-cv-header__name">{name}</h1>
      {role ? <p className="felix-cv-header__role">{role}</p> : null}
      <ul className="felix-cv-header__contacts">
        {location ? (
          <li>
            <MapPin aria-hidden className="felix-cv-header__icon" />
            <span>{location}</span>
          </li>
        ) : null}
        {email ? (
          <li>
            <Mail aria-hidden className="felix-cv-header__icon" />
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        ) : null}
      </ul>
      {links.length ? (
        <ul className="felix-cv-header__links">
          {links.map(({ href, icon: Icon, label }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer">
                <Icon aria-hidden className="felix-cv-header__icon" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  )
}

function ProfileHeader({
  description = '',
  image = '',
  location = '',
  name = 'Felix Wohnhaas',
  role = '',
}: ProfileHeaderProps) {
  return (
    <section className="felix-profile-header" aria-label={`${name} profile summary`}>
      {image ? <img src={image} alt={name} /> : null}
      <div className="felix-profile-header__body">
        <h1>{name}</h1>
        {description ? <p className="felix-profile-header__description">{description}</p> : null}
        <dl className="felix-profile-header__meta">
          {role ? (
            <div>
              <dt>Role</dt>
              <dd>{role}</dd>
            </div>
          ) : null}
          {location ? (
            <div>
              <dt>Location</dt>
              <dd>{location}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  )
}

function renderHeading(key: number, level: number, text: string) {
  const children = renderInlineMarkdown(text)

  switch (level) {
    case 1:
      return <h1 key={key}>{children}</h1>
    case 2:
      return <h2 key={key}>{children}</h2>
    case 3:
      return <h3 key={key}>{children}</h3>
    case 4:
      return <h4 key={key}>{children}</h4>
    case 5:
      return <h5 key={key}>{children}</h5>
    default:
      return <h6 key={key}>{children}</h6>
  }
}

function renderParagraphLines(lines: Array<string>) {
  return lines.flatMap((line, index) => {
    const renderedLine = renderInlineMarkdown(line)

    if (index === lines.length - 1) {
      return renderedLine
    }

    return [...renderedLine, <br key={`break-${index}`} />]
  })
}

function renderInlineMarkdown(text: string) {
  const parts: ReactNode[] = []
  let cursor = 0

  while (cursor < text.length) {
    const token = readInlineToken(text, cursor, parts.length)

    if (token) {
      parts.push(token.node)
      cursor = token.nextIndex
      continue
    }

    const nextIndex = findNextInlineTokenStart(text, cursor + 1)

    parts.push(text.slice(cursor, nextIndex))
    cursor = nextIndex
  }

  return parts
}

function readInlineToken(text: string, index: number, key: number): { nextIndex: number; node: ReactNode } | null {
  const htmlToken = readHtmlInlineToken(text, index, key)
  if (htmlToken) return htmlToken

  if (text[index] === '`') {
    const endIndex = text.indexOf('`', index + 1)

    if (endIndex > index) {
      return {
        nextIndex: endIndex + 1,
        node: <code key={key}>{text.slice(index + 1, endIndex)}</code>,
      }
    }
  }

  if (text[index] === '[') {
    const labelEndIndex = findClosingDelimiter(text, index + 1, ']')

    if (labelEndIndex > index && text[labelEndIndex + 1] === '(') {
      const hrefEndIndex = findClosingDelimiter(text, labelEndIndex + 2, ')')

      if (hrefEndIndex > labelEndIndex) {
        const href = text.slice(labelEndIndex + 2, hrefEndIndex)
        const children = renderInlineMarkdown(text.slice(index + 1, labelEndIndex))

        return {
          nextIndex: hrefEndIndex + 1,
          node: isExternalUrl(href) ? (
            <a key={key} href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ) : (
            <Link key={key} to={href}>
              {children}
            </Link>
          ),
        }
      }
    }
  }

  if (text.startsWith('**', index) || text.startsWith('__', index)) {
    const delimiter = text.slice(index, index + 2)
    const endIndex = findClosingDelimiter(text, index + 2, delimiter)

    if (endIndex > index) {
      return {
        nextIndex: endIndex + 2,
        node: <strong key={key}>{renderInlineMarkdown(text.slice(index + 2, endIndex))}</strong>,
      }
    }
  }

  if (text[index] === '*' || text[index] === '_') {
    const delimiter = text[index]
    const endIndex = findClosingDelimiter(text, index + 1, delimiter)

    if (endIndex > index) {
      return {
        nextIndex: endIndex + 1,
        node: <em key={key}>{renderInlineMarkdown(text.slice(index + 1, endIndex))}</em>,
      }
    }
  }

  return null
}

function readHtmlInlineToken(text: string, index: number, key: number) {
  const descriptors = [
    { close: '</strong>', open: '<strong>', tag: 'strong' },
    { close: '</b>', open: '<b>', tag: 'strong' },
    { close: '</em>', open: '<em>', tag: 'em' },
    { close: '</i>', open: '<i>', tag: 'em' },
  ] as const

  for (const descriptor of descriptors) {
    if (!text.startsWith(descriptor.open, index)) continue

    const contentStartIndex = index + descriptor.open.length
    const endIndex = text.indexOf(descriptor.close, contentStartIndex)

    if (endIndex === -1) return null

    const children = renderInlineMarkdown(text.slice(contentStartIndex, endIndex))

    return {
      nextIndex: endIndex + descriptor.close.length,
      node:
        descriptor.tag === 'strong' ? (
          <strong key={key}>{children}</strong>
        ) : (
          <em key={key}>{children}</em>
        ),
    }
  }

  return null
}

function findClosingDelimiter(text: string, startIndex: number, delimiter: string) {
  let cursor = startIndex

  while (cursor < text.length) {
    const index = text.indexOf(delimiter, cursor)

    if (index === -1) return -1
    if (text[index - 1] !== '\\') return index

    cursor = index + delimiter.length
  }

  return -1
}

function findNextInlineTokenStart(text: string, startIndex: number) {
  const candidates = ['[', '`', '*', '_', '<strong>', '<b>', '<em>', '<i>']
    .map((token) => text.indexOf(token, startIndex))
    .filter((index) => index !== -1)

  return candidates.length ? Math.min(...candidates) : text.length
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href)
}
