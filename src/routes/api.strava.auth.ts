import { createFileRoute } from '@tanstack/react-router'

import { getStravaAuthorizeUrl } from '../apps/strava/stravaData'

export const Route = createFileRoute('/api/strava/auth')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)

        return Response.redirect(getStravaAuthorizeUrl(url.origin), 302)
      },
    },
  },
})
