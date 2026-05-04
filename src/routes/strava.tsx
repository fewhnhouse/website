import { createFileRoute } from '@tanstack/react-router'

import { Desktop } from '@/desktop/Desktop'
import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/strava')({
  validateSearch: desktopSearchValidator,
  component: StravaRoute,
})

function StravaRoute() {
  return <Desktop routeApp="strava" />
}
