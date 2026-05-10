import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/issues')({
  validateSearch: desktopSearchValidator,
  component: IssuesRoute,
})

function IssuesRoute() {
  return null
}
