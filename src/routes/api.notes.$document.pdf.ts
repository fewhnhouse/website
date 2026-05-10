import { createFileRoute } from '@tanstack/react-router'

import { renderNoteDocumentToPdf } from '@/apps/notes/browserPdf.server'
import { notesPdfFilename } from '@/apps/notes/pdfFilename'
import type { NotesDocumentId } from '@/desktop/types'

export const Route = createFileRoute('/api/notes/$document/pdf')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const document = parseNotesDocument(params.document)

        if (!document) {
          return new Response('Document not found', { status: 404 })
        }

        const origin = new URL(request.url).origin

        return pdfResponse(await renderNoteDocumentToPdf(origin, document), document)
      },
    },
  },
})

function parseNotesDocument(document: string): NotesDocumentId | null {
  if (document === 'home' || document === 'cv') return document

  return null
}

function pdfResponse(pdf: Uint8Array, document: NotesDocumentId) {
  return new Response(pdf, {
    headers: {
      'Content-Disposition': `attachment; filename="${notesPdfFilename(document)}"`,
      'Content-Type': 'application/pdf',
    },
  })
}
