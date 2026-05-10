import { createFileRoute } from '@tanstack/react-router'

import { createGithubCallbackResponse } from '../apps/issues/githubAuth.server'

export const Route = createFileRoute('/api/github/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => createGithubCallbackResponse(request),
    },
  },
})
