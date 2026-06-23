import { createFileRoute } from '@tanstack/react-router'

import {
  STRAVA_CACHE_CONTROL,
  STRAVA_CACHE_MS,
  getStravaData,
} from '@/apps/strava/stravaData'
import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/strava')({
  validateSearch: desktopSearchValidator,
  loader: () => getStravaData(),
  staleTime: STRAVA_CACHE_MS,
  gcTime: STRAVA_CACHE_MS * 2,
  headers: () => ({
    'Cache-Control': STRAVA_CACHE_CONTROL,
  }),
  component: StravaRoute,
})

function StravaRoute() {
  return null
}
