import type { NotesDocumentId } from '@/desktop/types'

import cvMarkdown from './cv.mdx?raw'
import homeMarkdown from './home.mdx?raw'

export type NotesMarkdownByDocument = Record<NotesDocumentId, string>

export const initialNotesMarkdown = {
  home: homeMarkdown,
  cv: cvMarkdown,
} satisfies NotesMarkdownByDocument
