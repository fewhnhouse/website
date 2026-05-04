import { createServerFn } from '@tanstack/react-start'

import type { GithubData, GithubRepo } from './types'

export const GITHUB_CACHE_MS = 24 * 60 * 60 * 1000
export const GITHUB_CACHE_CONTROL = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'

let githubDataCache:
  | {
      data: GithubData
      expiresAt: number
    }
  | null = null
let githubDataPromise: Promise<GithubData> | null = null

type GithubApiRepo = {
  description: string | null
  forks_count?: number
  full_name: string
  html_url: string
  language?: string | null
  name: string
  owner?: {
    avatar_url: string
    login: string
  } | null
  private?: boolean
  pushed_at?: string | null
  stargazers_count?: number
  updated_at?: string | null
}

function toGithubRepo(repo: GithubApiRepo): GithubRepo {
  return {
    description: repo.description,
    forks_count: repo.forks_count,
    full_name: repo.full_name,
    html_url: repo.html_url,
    language: repo.language ?? null,
    name: repo.name,
    owner: repo.owner
      ? {
          avatar_url: repo.owner.avatar_url,
          login: repo.owner.login,
        }
      : undefined,
    private: repo.private,
    stargazers_count: repo.stargazers_count ?? 0,
    updated_at: repo.updated_at ?? repo.pushed_at ?? '',
  }
}

export const getGithubData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GithubData> => {
    const { setResponseHeader } = await import('@tanstack/react-start/server')

    setResponseHeader('Cache-Control', GITHUB_CACHE_CONTROL)

    const now = Date.now()

    if (githubDataCache && githubDataCache.expiresAt > now) {
      return githubDataCache.data
    }

    if (githubDataPromise) {
      return githubDataPromise
    }

    githubDataPromise = fetchGithubData()
      .then((data) => {
        githubDataCache = {
          data,
          expiresAt: Date.now() + GITHUB_CACHE_MS,
        }

        return data
      })
      .finally(() => {
        githubDataPromise = null
      })

    return githubDataPromise
  },
)

async function fetchGithubData(): Promise<GithubData> {
  const { Octokit } = await import('@octokit/rest')
  const personalToken =
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const organizationToken = process.env.GITHUB_ORG_ACCESS_TOKEN
  const login = process.env.GITHUB_USERNAME || 'fewhnhouse'
  const octokit = new Octokit({
    auth: personalToken,
    userAgent: 'felix-website',
  })
  const organizationOctokit = organizationToken
    ? new Octokit({
        auth: organizationToken,
        userAgent: 'felix-website',
      })
    : null

  const [{ data: userData }, { data: recentRepoData }, { data: starredRepoData }] =
    await Promise.all([
      octokit.rest.users.getByUsername({ username: login }),
      octokit.rest.repos.listForUser({
        direction: 'desc',
        per_page: 8,
        sort: 'updated',
        username: login,
      }),
      octokit.rest.activity.listReposStarredByUser({
        per_page: 8,
        sort: 'updated',
        username: login,
      }),
    ])

  const organizationRepoData = organizationOctokit
    ? await organizationOctokit
        .paginate(organizationOctokit.rest.repos.listForAuthenticatedUser, {
          affiliation: 'organization_member,collaborator',
          direction: 'desc',
          per_page: 100,
          sort: 'updated',
          visibility: 'all',
        })
        .then((data) => data.filter((repo) => repo.owner?.login !== login))
        .catch(() => [])
    : []

  const emptyContributionCalendar: GithubData['contributions'] = {
    available: false,
    days: [],
    totalContributions: null,
  }

  const fetchContributionCalendar = async (
    client: typeof octokit,
  ): Promise<GithubData['contributions'] | null> => {
    const contributionData = await client.graphql<{
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number
            weeks: Array<{
              contributionDays: Array<{
                contributionCount: number
                date: string
              }>
            }>
          }
        }
      }
    }>(
      `query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }`,
      { login },
    )

    return {
      available: true,
      days: contributionData.user.contributionsCollection.contributionCalendar.weeks.flatMap(
        (week) => week.contributionDays,
      ),
      totalContributions:
        contributionData.user.contributionsCollection.contributionCalendar.totalContributions,
    }
  }

  let contributionCalendar = emptyContributionCalendar
  const personalContributionCalendar = personalToken
    ? await fetchContributionCalendar(octokit).catch(() => null)
    : null
  const organizationContributionCalendar = organizationOctokit
    ? await fetchContributionCalendar(organizationOctokit).catch(() => null)
    : null

  if (personalToken) {
    contributionCalendar = personalContributionCalendar ?? emptyContributionCalendar
  }

  if (
    organizationContributionCalendar &&
    (organizationContributionCalendar.totalContributions ?? 0) >
      (contributionCalendar.totalContributions ?? 0)
  ) {
    contributionCalendar = organizationContributionCalendar
  }

  const organizationGraphqlExpandedCalendar =
    organizationContributionCalendar &&
    (organizationContributionCalendar.totalContributions ?? 0) >
      (personalContributionCalendar?.totalContributions ?? 0)

  if (organizationOctokit && organizationRepoData.length > 0) {
    const since = new Date()
    since.setFullYear(since.getFullYear() - 1)
    const sinceIso = since.toISOString()
    const dailyCompanyCommits = new Map<string, number>()
    const activeOrganizationRepos = organizationRepoData
      .filter((repo) => new Date(repo.updated_at ?? repo.pushed_at ?? 0) >= since)
      .slice(0, 100)

    await Promise.all(
      activeOrganizationRepos.map(async (repo) => {
        if (!repo.owner) return

        const commits = await organizationOctokit
          .paginate(organizationOctokit.rest.repos.listCommits, {
            author: login,
            owner: repo.owner.login,
            per_page: 100,
            repo: repo.name,
            since: sinceIso,
          })
          .catch(() => [])

        commits.forEach((commit) => {
          const date = commit.commit.author?.date?.slice(0, 10)

          if (!date) return

          dailyCompanyCommits.set(date, (dailyCompanyCommits.get(date) ?? 0) + 1)
        })
      }),
    )

    if (dailyCompanyCommits.size > 0) {
      const mergedDays = new Map(
        contributionCalendar.days.map((day) => [day.date, day.contributionCount]),
      )

      if (contributionCalendar.days.length === 0) {
        dailyCompanyCommits.forEach((count, date) => {
          mergedDays.set(date, count)
        })
      }

      const days =
        contributionCalendar.days.length > 0
          ? contributionCalendar.days.map((day) => {
              const companyCount = dailyCompanyCommits.get(day.date) ?? 0
              const contributionCount = organizationGraphqlExpandedCalendar
                ? Math.max(day.contributionCount, companyCount)
                : day.contributionCount + companyCount

              mergedDays.set(day.date, contributionCount)

              return {
                ...day,
                contributionCount,
              }
            })
          : Array.from(mergedDays.entries())
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, contributionCount]) => ({ contributionCount, date }))
      const totalContributions = days.reduce((total, day) => total + day.contributionCount, 0)
      contributionCalendar = {
        ...contributionCalendar,
        available: true,
        days,
        totalContributions,
      }
    }
  }

  return {
    contributions: contributionCalendar,
    recentRepos: recentRepoData.map((repo) => toGithubRepo(repo)),
    starredRepos: starredRepoData.map((item) => {
      const repo = 'repo' in item ? item.repo : item

      return toGithubRepo(repo)
    }),
    user: {
      avatar_url: userData.avatar_url,
      company: userData.company,
      followers: userData.followers,
      following: userData.following,
      html_url: userData.html_url,
      login: userData.login,
      location: userData.location,
      name: userData.name,
      public_repos: userData.public_repos,
    },
  }
}
