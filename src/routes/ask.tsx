import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/ask')({
  validateSearch: desktopSearchValidator,
  component: AskRoute,
})

function AskRoute() {
  return null
}
