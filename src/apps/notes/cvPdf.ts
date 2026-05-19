type PdfBlock =
  | { level: number; text: string; type: 'heading' }
  | { items: Array<string>; type: 'list' }
  | { lines: Array<string>; type: 'paragraph' }
  | { props: ProfileHeaderProps; type: 'profileHeader' }
  | { props: CvHeaderProps; type: 'cvHeader' }

type PdfPage = {
  commands: Array<string>
}

type ProfileHeaderProps = {
  description?: string
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

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 54
const MARGIN_TOP = 54
const MARGIN_BOTTOM = 54
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2
const INK = '0.090 0.140 0.160'
const INK_MUTED = '0.250 0.320 0.340'
const LAGOON = '0.196 0.561 0.592'
const LAGOON_LIGHT = '0.310 0.722 0.698'
const BODY_FONT_SIZE = 10.6
const BODY_LINE_HEIGHT = 17.4
const LIST_FONT_SIZE = 10.4
const LIST_LINE_HEIGHT = 17

export function renderNoteMarkdownToPdf(markdown: string) {
  const renderer = new PdfRenderer()

  renderer.render(parseMarkdownBlocks(markdown))

  return renderer.toPdf()
}

function parseMarkdownBlocks(markdown: string) {
  const lines = markdown.trim().split('\n')
  const blocks: Array<PdfBlock> = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()

    if (!line) continue

    if (line.startsWith('<ProfileHeader')) {
      const componentLines = [line]

      while (!lines[index].trim().endsWith('/>') && index + 1 < lines.length) {
        index += 1
        componentLines.push(lines[index].trim())
      }

      blocks.push({ type: 'profileHeader', props: parseProfileHeaderProps(componentLines.join(' ')) })
      continue
    }

    if (line.startsWith('<CvHeader')) {
      const componentLines = [line]

      while (!lines[index].trim().endsWith('/>') && index + 1 < lines.length) {
        index += 1
        componentLines.push(lines[index].trim())
      }

      blocks.push({ type: 'cvHeader', props: parseCvHeaderProps(componentLines.join(' ')) })
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      continue
    }

    if (line.startsWith('- ')) {
      const items: Array<string> = []

      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(stripInlineMarkdown(lines[index].trim().slice(2)))
        index += 1
      }

      index -= 1
      blocks.push({ type: 'list', items })
      continue
    }

    const paragraph = [stripInlineMarkdown(line)]

    while (index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim()

      if (!nextLine || /^#{1,6}\s+/.test(nextLine) || nextLine.startsWith('- ')) {
        break
      }

      paragraph.push(stripInlineMarkdown(nextLine))
      index += 1
    }

    blocks.push({ type: 'paragraph', lines: paragraph })
  }

  return blocks
}

function parseProfileHeaderProps(source: string): ProfileHeaderProps {
  const props: ProfileHeaderProps = {}
  const attributePattern = /(name|description|role|location)="([^"]*)"/g
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

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\[(`?)([^`\]]+)\1\]\([^)]+\)/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
}

class PdfRenderer {
  private page: PdfPage = { commands: [] }
  private readonly pages: Array<PdfPage> = [this.page]
  private y = PAGE_HEIGHT - MARGIN_TOP

  render(blocks: Array<PdfBlock>) {
    for (const block of blocks) {
      if (block.type === 'profileHeader') {
        this.renderProfileHeader(block.props)
      } else if (block.type === 'cvHeader') {
        this.renderCvHeader(block.props)
      } else if (block.type === 'heading') {
        this.renderHeading(block.level, block.text)
      } else if (block.type === 'list') {
        this.renderList(block.items)
      } else {
        this.renderParagraph(block.lines)
      }
    }
  }

  toPdf() {
    const objects: Array<string> = []
    const catalogId = 1
    const pagesId = 2
    const fontRegularId = 3
    const fontBoldId = 4
    const pageIds: Array<number> = []

    objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
    objects[fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    objects[fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

    let nextId = 5
    for (const page of this.pages) {
      const pageId = nextId
      const contentId = nextId + 1
      nextId += 2
      pageIds.push(pageId)

      const content = page.commands.join('\n')

      objects[pageId] =
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> ` +
        `/Contents ${contentId} 0 R >>`
      objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    }

    objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

    const chunks = ['%PDF-1.4\n']
    const offsets = [0]

    for (let id = 1; id < objects.length; id += 1) {
      offsets[id] = chunks.join('').length
      chunks.push(`${id} 0 obj\n${objects[id]}\nendobj\n`)
    }

    const xrefOffset = chunks.join('').length

    chunks.push(`xref\n0 ${objects.length}\n`)
    chunks.push('0000000000 65535 f \n')

    for (let id = 1; id < objects.length; id += 1) {
      chunks.push(`${offsets[id].toString().padStart(10, '0')} 00000 n \n`)
    }

    chunks.push(`trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`)

    return new TextEncoder().encode(chunks.join(''))
  }

  private renderCvHeader({
    email = '',
    github = '',
    linkedin = '',
    location = '',
    name = 'Felix Wohnhaas',
    role = '',
    website = '',
  }: CvHeaderProps) {
    this.ensureSpace(132)
    this.text('Curriculum vitae', MARGIN_X, this.y, 9.2, 'F2', INK_MUTED)
    this.y -= 18
    this.text(name, MARGIN_X, this.y, 25, 'F2', INK)
    this.y -= 30

    for (const line of wrapText(role, 11.2, CONTENT_WIDTH)) {
      this.text(line, MARGIN_X, this.y, 11.2, 'F1', INK_MUTED)
      this.y -= 18
    }

    this.y -= 4

    const contact = [location, email].filter(Boolean).join('  |  ')
    if (contact) {
      this.text(contact, MARGIN_X, this.y, 10.2, 'F2', LAGOON)
      this.y -= 20
    }

    const links = [
      website ? `Website: ${website}` : '',
      linkedin ? `LinkedIn: ${linkedin}` : '',
      github ? `GitHub: ${github}` : '',
    ].filter(Boolean)

    if (links.length) {
      this.text(links.join('  |  '), MARGIN_X, this.y, 9.4, 'F1', LAGOON)
      this.y -= 20
    }

    this.y -= 8
  }

  private renderProfileHeader({ description = '', location = '', name = 'Felix Wohnhaas', role = '' }: ProfileHeaderProps) {
    this.ensureSpace(118)
    this.text(name, MARGIN_X, this.y, 25, 'F2', INK)
    this.y -= 30

    for (const line of wrapText(description, 11.2, CONTENT_WIDTH)) {
      this.text(line, MARGIN_X, this.y, 11.2, 'F1', INK_MUTED)
      this.y -= 18
    }

    this.y -= 7

    if (role || location) {
      const meta = [role, location].filter(Boolean).join('  |  ')
      this.text(meta, MARGIN_X, this.y, 10.6, 'F2', LAGOON)
      this.y -= 22
    }

    this.line(MARGIN_X, this.y + 4, CONTENT_WIDTH, '0.78 0.88 0.86')
    this.y -= 20
  }

  private renderHeading(level: number, text: string) {
    if (level === 1) {
      this.ensureSpace(62)
      this.text(text, MARGIN_X, this.y, 25, 'F2', INK)
      this.y -= 42
      return
    }

    if (level === 2) {
      this.ensureSpace(56)
      this.line(MARGIN_X, this.y + 12, CONTENT_WIDTH, '0.78 0.88 0.86')
      this.text(text, MARGIN_X, this.y - 6, 17, 'F2', LAGOON)
      this.y -= 38
      return
    }

    this.ensureSpace(48)
    this.rect(MARGIN_X, this.y - 18, 3, 17, LAGOON_LIGHT)
    this.text(text, MARGIN_X + 10, this.y - 16, 12.2, 'F2', INK)
    this.y -= 42
  }

  private renderParagraph(lines: Array<string>) {
    const wrappedLines = lines.flatMap((line) => wrapText(line, BODY_FONT_SIZE, CONTENT_WIDTH))

    this.ensureSpace(wrappedLines.length * BODY_LINE_HEIGHT + 12)

    for (const line of wrappedLines) {
      this.text(line, MARGIN_X, this.y, BODY_FONT_SIZE, 'F1', INK_MUTED)
      this.y -= BODY_LINE_HEIGHT
    }

    this.y -= 10
  }

  private renderList(items: Array<string>) {
    for (const item of items) {
      const wrappedLines = wrapText(item, LIST_FONT_SIZE, CONTENT_WIDTH - 18)
      this.ensureSpace(wrappedLines.length * LIST_LINE_HEIGHT + 6)
      this.text('•', MARGIN_X, this.y, LIST_FONT_SIZE, 'F2', LAGOON)

      for (const [index, line] of wrappedLines.entries()) {
        this.text(line, MARGIN_X + 16, this.y - index * LIST_LINE_HEIGHT, LIST_FONT_SIZE, 'F1', INK_MUTED)
      }

      this.y -= wrappedLines.length * LIST_LINE_HEIGHT + 5
    }

    this.y -= 7
  }

  private ensureSpace(required: number) {
    if (this.y - required >= MARGIN_BOTTOM) return

    this.page = { commands: [] }
    this.pages.push(this.page)
    this.y = PAGE_HEIGHT - MARGIN_TOP
  }

  private text(text: string, x: number, y: number, size: number, font: 'F1' | 'F2', color: string) {
    this.page.commands.push(`BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`)
  }

  private line(x: number, y: number, width: number, color: string) {
    this.page.commands.push(`${color} RG 0.75 w ${x} ${y} m ${x + width} ${y} l S`)
  }

  private rect(x: number, y: number, width: number, height: number, color: string) {
    this.page.commands.push(`${color} rg ${x} ${y} ${width} ${height} re f`)
  }
}

function wrapText(text: string, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: Array<string> = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word

    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      line = candidate
      continue
    }

    if (line) lines.push(line)
    line = word
  }

  if (line) lines.push(line)

  return lines
}

function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * 0.49
}

function escapePdfText(text: string) {
  return normalizePdfText(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function normalizePdfText(text: string) {
  return text
    .replaceAll('•', '*')
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('‘', "'")
    .replaceAll('’', "'")
    .replace(/[^\x20-\x7e]/g, '')
}
