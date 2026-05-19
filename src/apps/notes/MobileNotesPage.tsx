import { Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'

import type { NotesDocumentId } from '@/desktop/types'

import { initialNotesMarkdown } from './notesMarkdown'
import { notesPdfFilename } from './pdfFilename'
import { RenderedMarkdown } from './RenderedMarkdown'

const mobileHeaderActionClass =
  'inline-flex shrink-0 items-center gap-1.5 rounded-control border border-os-border bg-white/65 px-3 py-1.5 text-caption font-black text-lagoon-deep no-underline'

type MobileNotesPageProps = {
  document: NotesDocumentId
  print?: boolean
}

export function MobileNotesPage({ document, print = false }: MobileNotesPageProps) {
  const markdown = initialNotesMarkdown[document]
  const renderedMarkdown = print
    ? markdown.replace('image="/felix-portrait.jpg"', 'image="/felix-portrait-pdf.jpg"')
    : markdown
  const currentLabel = document === 'cv' ? 'cv.mdx' : 'home.mdx'
  const alternateDocument = document === 'cv' ? 'home' : 'cv'
  const alternateLabel = alternateDocument === 'cv' ? 'cv.mdx' : 'home.mdx'
  const pdfFilename = notesPdfFilename(document)

  return (
    <main className="min-h-[100svh] bg-foam text-os-ink">
      {print ? null : (
        <header className="sticky top-0 z-10 border-b border-os-border bg-foam/92 px-4 py-3 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-2xl items-center justify-between gap-3" aria-label="Mobile documents">
            <div className="flex min-w-0 items-center gap-2 text-os-ink">
              <img
                className="size-8 rounded-full border border-white/80 object-cover object-[50%_31%] shadow-os-logo"
                src="/felix-portrait.jpg"
                alt=""
                aria-hidden="true"
              />
              <span className="truncate font-black">{currentLabel}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`/api/notes/${document}/pdf`}
                download={pdfFilename}
                className={mobileHeaderActionClass}
              >
                <Download className="size-3.5" aria-hidden />
                <span>PDF</span>
                <span className="sr-only">Download {currentLabel}</span>
              </a>
              <Link
                to={alternateDocument === 'cv' ? '/cv' : '/home'}
                search={
                  alternateDocument === 'cv'
                    ? { minimized: false, maximized: false, x: 122, y: 118 }
                    : { minimized: false, maximized: false, x: 84, y: 92 }
                }
                className={mobileHeaderActionClass}
              >
                {alternateLabel}
              </Link>
            </div>
          </nav>
          <p className="felix-mobile-experience-banner mx-auto max-w-2xl">
            For the full FelixOS experience, visit on a desktop screen.
          </p>
        </header>
      )}

      <RenderedMarkdown
        className={`felix-mobile-mdx felix-mdx-content mx-auto max-w-2xl px-5 pb-10 ${
          print ? 'felix-pdf-mdx pt-0' : 'pt-6'
        }`}
        markdown={renderedMarkdown}
      />
    </main>
  )
}
