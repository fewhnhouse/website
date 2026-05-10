import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/settings')({
  validateSearch: desktopSearchValidator,
  component: SettingsRoute,
})

function SettingsRoute() {
  return null
}
