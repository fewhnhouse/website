import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/cv')({
  validateSearch: desktopSearchValidator,
  component: CvRoute,
})

function CvRoute() {
  return null
}
