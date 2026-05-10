import { createFileRoute } from '@tanstack/react-router'

import { browserSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/browser')({
  validateSearch: browserSearchValidator,
  component: BrowserRoute,
})

function BrowserRoute() {
  return null
}
