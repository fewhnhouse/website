import { ClientOnly } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import type { RefObject } from 'react'

import type { NotesDocumentId } from '@/desktop/types'
import { cn } from '@/lib/cn'

import { initialNotesMarkdown } from './notesMarkdown'
import { loadLocalMdxEditor } from './loadMdxEditor.client'
import { notesPdfFilename } from './pdfFilename'
import { RenderedMarkdown } from './RenderedMarkdown'
import {
  osBtnSmClass,
  osChipClass,
  osScrollClass,
  osToolbarButtonActiveClass,
} from '../shared/appStyles'

const LocalMdxEditor = lazy(loadLocalMdxEditor)

type NotesAppProps = {
  document: NotesDocumentId
  documentRef: RefObject<HTMLElement | null>
  markdown: string
  onMarkdownChange: (document: NotesDocumentId, markdown: string) => void
  onResetDocument: (document: NotesDocumentId) => void
}

const documentClass =
  `min-h-0 flex-1 overflow-y-auto overscroll-contain text-os-ink ${osScrollClass} [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_86px)] [.os-window--maximized_&]:max-h-none max-[720px]:[max-height:calc(100svh_-_14rem)]`
const fallbackClass =
  `m-0 h-full overflow-auto whitespace-pre-wrap px-6 pt-5 pb-6 font-mono text-[0.84rem] leading-relaxed text-os-ink ${osScrollClass} max-[720px]:p-4`
const notesPathChipClass =
  'box-border inline-flex h-8 min-w-0 items-center border-2 border-ink bg-foam px-2.5 py-0 font-mono text-[0.72rem] font-black leading-none text-ink shadow-inset'

export function NotesApp({
  document,
  documentRef,
  markdown,
  onMarkdownChange,
  onResetDocument,
}: NotesAppProps) {
  const filename = `${document}.mdx`
  const pdfFilename = notesPdfFilename(document)
  const isEdited = markdown !== initialNotesMarkdown[document]
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const readOnly = mode === 'preview'

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 border-b-2 border-ink bg-foam px-3 py-2.5"
        aria-label="Document toolbar"
      >
        <span className={notesPathChipClass}>~/felix-website/{filename}</span>
        <div className="ml-1 inline-flex overflow-hidden border-2 border-ink bg-foam">
          <button
            type="button"
            className={cn(
              osBtnSmClass,
              'border-0 shadow-none rounded-none',
              mode === 'preview' && osToolbarButtonActiveClass,
            )}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
          <button
            type="button"
            className={cn(
              osBtnSmClass,
              'border-0 shadow-none rounded-none border-l-2 border-ink',
              mode === 'edit' && osToolbarButtonActiveClass,
            )}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
        </div>
        {isEdited ? (
          <span className={cn(osChipClass, 'os-chip--coral')}>edited locally</span>
        ) : null}
        <button
          type="button"
          className={osBtnSmClass}
          onClick={() => onResetDocument(document)}
          disabled={!isEdited}
        >
          Reset
        </button>
        {isEdited ? (
          <button
            type="button"
            className={osBtnSmClass}
            disabled
            title="Reset local edits before downloading. PDFs are generated from the original document only."
          >
            Download PDF (reset edits first)
          </button>
        ) : (
          <a className={osBtnSmClass} href={`/api/notes/${document}/pdf`} download={pdfFilename}>
            Download PDF
          </a>
        )}
      </div>

      <section
        ref={documentRef}
        className={documentClass}
        aria-label={readOnly ? `${filename} preview` : `${filename} editor`}
      >
        {readOnly ? (
          <RenderedMarkdown className="felix-mdx-preview felix-mdx-content" markdown={markdown} />
        ) : (
          <ClientOnly fallback={<pre className={fallbackClass}>{markdown}</pre>}>
            <Suspense fallback={<pre className={fallbackClass}>{markdown}</pre>}>
              <LocalMdxEditor
                key={`${document}-${mode}`}
                markdown={markdown}
                onChange={(nextMarkdown) => onMarkdownChange(document, nextMarkdown)}
                readOnly={readOnly}
              />
            </Suspense>
          </ClientOnly>
        )}
      </section>
    </>
  )
}
