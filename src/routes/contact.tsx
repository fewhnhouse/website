import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/contact')({
  validateSearch: desktopSearchValidator,
  component: ContactRoute,
})

function ContactRoute() {
  return null
}
