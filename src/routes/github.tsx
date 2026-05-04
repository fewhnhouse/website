import { createFileRoute } from '@tanstack/react-router'

import { GITHUB_CACHE_CONTROL, GITHUB_CACHE_MS, getGithubData } from '@/apps/github/githubData'
import { desktopSearchValidator } from '@/desktop/routeState'

export const Route = createFileRoute('/github')({
  validateSearch: desktopSearchValidator,
  loader: () => getGithubData(),
  staleTime: GITHUB_CACHE_MS,
  gcTime: GITHUB_CACHE_MS * 2,
  headers: () => ({
    'Cache-Control': GITHUB_CACHE_CONTROL,
  }),
  component: GithubRoute,
})

function GithubRoute() {
  return null
}
