import { createFileRoute } from '@tanstack/react-router'

import { createGithubLogoutResponse } from '../apps/issues/githubAuth.server'

export const Route = createFileRoute('/api/github/logout')({
  server: {
    handlers: {
      GET: async ({ request }) => createGithubLogoutResponse(request),
    },
  },
})
