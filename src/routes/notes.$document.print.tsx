import { createFileRoute, notFound } from '@tanstack/react-router'

import { MobileNotesPage } from '@/apps/notes/MobileNotesPage'
import type { NotesDocumentId } from '@/desktop/types'

export const Route = createFileRoute('/notes/$document/print')({
  component: NotesPrintRoute,
})

function NotesPrintRoute() {
  const { document } = Route.useParams()
  const notesDocument = parseNotesDocument(document)

  if (!notesDocument) {
    throw notFound()
  }

  return <MobileNotesPage document={notesDocument} print />
}

function parseNotesDocument(document: string): NotesDocumentId | null {
  if (document === 'home' || document === 'cv') return document

  return null
}
