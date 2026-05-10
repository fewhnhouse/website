import { createFileRoute } from '@tanstack/react-router'

import { createGithubLoginResponse } from '../apps/issues/githubAuth.server'

export const Route = createFileRoute('/api/github/login')({
  server: {
    handlers: {
      GET: async ({ request }) => createGithubLoginResponse(request),
    },
  },
})
