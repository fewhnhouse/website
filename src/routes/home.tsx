import { createFileRoute } from '@tanstack/react-router'

import { Desktop } from '@/desktop/Desktop'
import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/home')({
  validateSearch: desktopSearchValidator,
  component: HomeRoute,
})

function HomeRoute() {
  return <Desktop routeApp="home" />
}
