import { ClientOnly } from '@tanstack/react-router'
import { lazy, Suspense, useState } from 'react'
import type { RefObject } from 'react'

import type { NotesDocumentId } from '@/desktop/types'

import { initialNotesMarkdown } from './documents'
import { loadLocalMdxEditor } from './loadMdxEditor.client'
import { RenderedMarkdown } from './RenderedMarkdown'

const LocalMdxEditor = lazy(loadLocalMdxEditor)

type NotesAppProps = {
  document: NotesDocumentId
  documentRef: RefObject<HTMLElement | null>
  markdown: string
  onMarkdownChange: (document: NotesDocumentId, markdown: string) => void
  onResetDocument: (document: NotesDocumentId) => void
}

const toolbarButtonClass =
  'cursor-pointer rounded-control border border-os-border bg-white/65 px-2.5 py-1.5 text-caption font-black text-os-ink-muted hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lagoon-deep/45 disabled:cursor-default disabled:opacity-55'
const activeToolbarButtonClass =
  'border-lagoon-deep/35 bg-lagoon/15 text-lagoon-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
const documentClass =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain text-os-ink [max-height:calc(min(640px,calc(100svh_-_7.25rem))_-_86px)] [scrollbar-color:rgba(50,143,151,0.46)_transparent] [.os-window--maximized_&]:[max-height:calc(100svh_-_218px)] max-[720px]:[max-height:calc(100svh_-_14rem)]'
const fallbackClass =
  'm-0 h-full overflow-auto whitespace-pre-wrap px-6 pt-5 pb-6 font-mono text-[0.84rem] leading-relaxed text-os-ink [scrollbar-color:rgba(50,143,151,0.46)_transparent] max-[720px]:p-4'

export function NotesApp({
  document,
  documentRef,
  markdown,
  onMarkdownChange,
  onResetDocument,
}: NotesAppProps) {
  const filename = `${document}.mdx`
  const isEdited = markdown !== initialNotesMarkdown[document]
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const readOnly = mode === 'preview'

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 border-b border-os-border bg-foam/80 px-3 py-2.5"
        aria-label="Document toolbar"
      >
        <span className="rounded-control border border-os-border bg-white/55 px-2.5 py-1.5 font-mono text-caption font-black text-lagoon-deep">
          ~/felix-website/{filename}
        </span>
        <button
          type="button"
          className={`${toolbarButtonClass} ${mode === 'preview' ? activeToolbarButtonClass : ''}`}
          onClick={() => setMode('preview')}
        >
          Preview
        </button>
        <button
          type="button"
          className={`${toolbarButtonClass} ${mode === 'edit' ? activeToolbarButtonClass : ''}`}
          onClick={() => setMode('edit')}
        >
          Edit
        </button>
        <span
          className={`rounded-control border px-2.5 py-1.5 text-caption font-black ${
            isEdited
              ? 'border-lagoon-deep/30 bg-lagoon/15 text-lagoon-deep'
              : 'border-os-border bg-white/45 text-os-ink-soft'
          }`}
        >
          {isEdited ? 'edited locally' : 'original'}
        </span>
        <button
          type="button"
          className={toolbarButtonClass}
          onClick={() => onResetDocument(document)}
          disabled={!isEdited}
        >
          Reset
        </button>
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
