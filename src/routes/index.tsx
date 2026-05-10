import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/')({
  validateSearch: desktopSearchValidator,
  component: IndexDesktop,
})

function IndexDesktop() {
  return null
}
