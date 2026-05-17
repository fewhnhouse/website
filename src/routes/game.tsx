import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/game')({
  validateSearch: desktopSearchValidator,
  component: GameRoute,
})

function GameRoute() {
  return null
}
