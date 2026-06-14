import { createFileRoute } from '@tanstack/react-router'

import {
  GuestbookValidationError,
  readEntries,
  submitEntry,
} from '@/apps/guestbook/guestbookStore.server'

export const Route = createFileRoute('/api/guestbook/entries')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const entries = await readEntries()
          return Response.json(entries)
        } catch (error) {
          console.error('Failed to read guestbook entries', error)
          return Response.json({ error: 'Failed to load entries' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
        }

        try {
          const entry = await submitEntry(body)
          return Response.json(entry)
        } catch (error) {
          if (error instanceof GuestbookValidationError) {
            return Response.json({ error: error.message }, { status: 400 })
          }
          console.error('Failed to submit guestbook entry', error)
          const message = error instanceof Error ? error.message : 'Failed to submit entry'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
