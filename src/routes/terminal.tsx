import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/terminal')({
  validateSearch: desktopSearchValidator,
  component: TerminalRoute,
})

function TerminalRoute() {
  return null
}
