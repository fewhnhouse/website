export type GithubUser = {
  avatar_url: string
  company: string | null
  followers: number
  following: number
  html_url: string
  login: string
  location: string | null
  name: string | null
  public_repos: number
}

export type GithubRepo = {
  description: string | null
  forks_count?: number
  full_name: string
  html_url: string
  language: string | null
  name: string
  private?: boolean
  stargazers_count: number
  updated_at: string
  owner?: {
    avatar_url: string
    login: string
  }
}

export type ContributionDay = {
  contributionCount: number
  date: string
}

export type GithubData = {
  contributions: {
    days: ContributionDay[]
    totalContributions: number | null
    available: boolean
  }
  recentRepos: GithubRepo[]
  starredRepos: GithubRepo[]
  user: GithubUser
}
