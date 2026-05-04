import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/strava')({
  validateSearch: desktopSearchValidator,
  component: StravaRoute,
})

function StravaRoute() {
  return null
}
