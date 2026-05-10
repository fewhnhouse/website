import { createFileRoute } from '@tanstack/react-router'

import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/skills')({
  validateSearch: desktopSearchValidator,
  component: SkillsRoute,
})

function SkillsRoute() {
  return null
}
