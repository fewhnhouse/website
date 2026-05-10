import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/help')({
  validateSearch: desktopSearchValidator,
  component: HelpRoute,
})

function HelpRoute() {
  return null
}
