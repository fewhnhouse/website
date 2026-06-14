import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/guestbook')({
  validateSearch: desktopSearchValidator,
  component: GuestbookRoute,
})

function GuestbookRoute() {
  return null
}
