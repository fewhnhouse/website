import { ClientOnly } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import type { RefObject } from 'react'

import type { NotesDocumentId } from '@/desktop/types'
import { cn } from '@/lib/cn'

import { initialNotesMarkdown } from './documents'
import { loadLocalMdxEditor } from './loadMdxEditor.client'
import { notesPdfFilename } from './pdfFilename'
import { RenderedMarkdown } from './RenderedMarkdown'
import { osToolbarButtonActiveClass } from '../shared/appStyles'

const LocalMdxEditor = lazy(loadLocalMdxEditor)

type NotesAppProps = {
  document: NotesDocumentId
  documentRef: RefObject<HTMLElement | null>
  markdown: string
  onMarkdownChange: (document: NotesDocumentId, markdown: string) => void
  onResetDocument: (document: NotesDocumentId) => void
}

const documentClass =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain text-os-ink [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_86px)] [scrollbar-color:rgba(50,143,151,0.46)_transparent] [.os-window--maximized_&]:max-h-none max-[720px]:[max-height:calc(100svh_-_14rem)]'
const fallbackClass =
  'm-0 h-full overflow-auto whitespace-pre-wrap px-6 pt-5 pb-6 font-mono text-[0.84rem] leading-relaxed text-os-ink [scrollbar-color:rgba(50,143,151,0.46)_transparent] max-[720px]:p-4'
const notesToolbarControlClass =
  'box-border inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-control border border-[rgba(20,38,45,0.12)] bg-white/65 px-2.5 py-0 font-[inherit] text-[0.72rem] font-black leading-none text-[#3b5560] no-underline hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2c4a55]/45 disabled:cursor-default disabled:opacity-55'
const notesToolbarSegmentClass =
  'box-border inline-flex h-8 shrink-0 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent px-3 py-0 font-[inherit] text-[0.72rem] font-black leading-none text-[#3b5560] no-underline hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2c4a55]/45 disabled:cursor-default disabled:opacity-55'
const notesToolbarChipClass =
  'box-border inline-flex h-8 shrink-0 items-center rounded-control border px-2.5 py-0 text-[0.72rem] font-black leading-none'

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
        className="flex flex-wrap items-center gap-2 border-b border-[rgba(20,38,45,0.1)] bg-[#eef3f0]/95 px-3 py-2.5"
        aria-label="Document toolbar"
      >
        <span className="box-border inline-flex h-8 min-w-0 items-center rounded-control border border-[rgba(20,38,45,0.12)] bg-white/70 px-2.5 py-0 font-mono text-[0.72rem] font-black leading-none text-[#2c4a55]">
          ~/felix-website/{filename}
        </span>
        <div className="ml-1 inline-flex overflow-hidden rounded-control border border-[rgba(20,38,45,0.12)] bg-white/55">
          <button
            type="button"
            className={cn(
              notesToolbarSegmentClass,
              mode === 'preview' && osToolbarButtonActiveClass,
            )}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
          <button
            type="button"
            className={cn(notesToolbarSegmentClass, mode === 'edit' && osToolbarButtonActiveClass)}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
        </div>
        {isEdited ? (
          <span
            className={`${notesToolbarChipClass} border-[#2c4a55]/25 bg-[#2c4a55]/10 text-[#2c4a55]`}
          >
            edited locally
          </span>
        ) : null}
        <button
          type="button"
          className={notesToolbarControlClass}
          onClick={() => onResetDocument(document)}
          disabled={!isEdited}
        >
          Reset
        </button>
        {isEdited ? (
          <button
            type="button"
            className={notesToolbarControlClass}
            disabled
            title="Reset local edits before downloading. PDFs are generated from the original document only."
          >
            Download PDF disabled: reset edits first
          </button>
        ) : (
          <a className={notesToolbarControlClass} href={`/api/notes/${document}/pdf`} download={pdfFilename}>
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
