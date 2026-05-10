import type { NotesDocumentId } from '@/desktop/types'

export function notesPdfFilename(document: NotesDocumentId) {
  return `${document}_felix_wohnhaas.pdf`
}
