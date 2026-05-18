import { createFileRoute } from '@tanstack/react-router'

import { readScores, submitScore } from '@/apps/game/scoresStore.server'

export const Route = createFileRoute('/api/runner/scores')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const scores = await readScores()
          return Response.json(scores)
        } catch (error) {
          console.error('Failed to read runner scores', error)
          return Response.json({ error: 'Failed to load scores' }, { status: 500 })
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
          const scores = await submitScore(body)
          return Response.json(scores)
        } catch (error) {
          console.error('Failed to submit runner score', error)
          const message = error instanceof Error ? error.message : 'Failed to submit score'
          const status = message === 'Invalid score submission' ? 400 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
