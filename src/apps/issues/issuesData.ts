import { createServerFn } from '@tanstack/react-start'

import type {
  CreateIssueInput,
  GithubIssueUser,
  IssueLabel,
  IssuesBoardData,
  ProjectIssue,
} from './types'

const ISSUE_REPO_OWNER = 'fewhnhouse'
const ISSUE_REPO_NAME = 'website'
const ISSUE_REPO_FULL_NAME = `${ISSUE_REPO_OWNER}/${ISSUE_REPO_NAME}`
const ISSUE_REPO_URL = `https://github.com/${ISSUE_REPO_FULL_NAME}`
const ISSUE_USER_AGENT = 'felix-website-issues'
const ISSUE_CREATE_LABELS = ['from-website']

let issuesCache:
  | {
      data: IssuesBoardData
      expiresAt: number
    }
  | null = null

const ISSUES_CACHE_MS = 30 * 1000

function getGithubToken() {
  return (
    process.env.GITHUB_ISSUES_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN
  )
}

function normalizeCreateIssueInput(data: CreateIssueInput): CreateIssueInput {
  const title = data.title.trim()
  const body = data.body.trim()

  if (title.length < 4) {
    throw new Error('Issue title must be at least 4 characters.')
  }

  if (title.length > 160) {
    throw new Error('Issue title must be 160 characters or fewer.')
  }

  if (body.length > 4000) {
    throw new Error('Issue body must be 4000 characters or fewer.')
  }

  return { body, title }
}

function toIssueLabels(labels: unknown[]): IssueLabel[] {
  return labels
    .map((label) => {
      if (!label || typeof label !== 'object') return null
      const candidate = label as { color?: unknown; name?: unknown }

      if (typeof candidate.name !== 'string') return null

      return {
        color: typeof candidate.color === 'string' ? candidate.color : 'd0d7de',
        name: candidate.name,
      }
    })
    .filter((label): label is IssueLabel => Boolean(label))
}

export const getIssuesBoardData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<IssuesBoardData> => {
    const now = Date.now()

    if (issuesCache && issuesCache.expiresAt > now) {
      return issuesCache.data
    }

    const data = await fetchIssuesBoardData()
    issuesCache = {
      data,
      expiresAt: Date.now() + ISSUES_CACHE_MS,
    }

    return data
  },
)

export const getGithubIssueUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GithubIssueUser | null> => {
    const { getRequest } = await import('@tanstack/react-start/server')
    const { getGithubIssueSessionFromCookie } = await import('./githubAuth.server')
    const request = getRequest()
    const session = getGithubIssueSessionFromCookie(request.headers.get('cookie'), new URL(request.url).origin)

    return session?.user ?? null
  },
)

export const createProjectIssue = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateIssueInput) => normalizeCreateIssueInput(data))
  .handler(async ({ data }): Promise<ProjectIssue> => {
    const { Octokit } = await import('@octokit/rest')
    const { getRequest } = await import('@tanstack/react-start/server')
    const { getGithubIssueSessionFromCookie } = await import('./githubAuth.server')
    const request = getRequest()
    const session = getGithubIssueSessionFromCookie(request.headers.get('cookie'), new URL(request.url).origin)
    const token = session?.accessToken

    if (!token) {
      throw new Error('Sign in with GitHub before creating an issue.')
    }

    const octokit = new Octokit({
      auth: token,
      userAgent: ISSUE_USER_AGENT,
    })
    const response = await octokit.rest.issues.create({
      body: data.body || undefined,
      labels: ISSUE_CREATE_LABELS,
      owner: ISSUE_REPO_OWNER,
      repo: ISSUE_REPO_NAME,
      title: data.title,
    })

    issuesCache = null

    return toProjectIssue(response.data)
  })

async function fetchIssuesBoardData(): Promise<IssuesBoardData> {
  const { Octokit } = await import('@octokit/rest')
  const token = getGithubToken()
  const octokit = new Octokit({
    auth: token,
    userAgent: ISSUE_USER_AGENT,
  })
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    direction: 'desc',
    owner: ISSUE_REPO_OWNER,
    per_page: 100,
    repo: ISSUE_REPO_NAME,
    sort: 'updated',
    state: 'all',
  })

  return {
    fetchedAt: new Date().toISOString(),
    issues: issues.filter((issue) => !issue.pull_request).map((issue) => toProjectIssue(issue)),
    repository: {
      fullName: ISSUE_REPO_FULL_NAME,
      htmlUrl: ISSUE_REPO_URL,
    },
  }
}

function toProjectIssue(issue: {
  body?: string | null
  comments?: number
  created_at?: string
  html_url?: string
  labels?: unknown[]
  number?: number
  state?: string
  title?: string
  updated_at?: string
  user?: {
    avatar_url?: string
    html_url?: string
    login?: string
  } | null
}): ProjectIssue {
  return {
    author: issue.user?.login
      ? {
          avatarUrl: issue.user.avatar_url ?? '',
          login: issue.user.login,
          url: issue.user.html_url ?? '',
        }
      : null,
    body: issue.body ?? null,
    comments: issue.comments ?? 0,
    createdAt: issue.created_at ?? '',
    htmlUrl: issue.html_url ?? ISSUE_REPO_URL,
    labels: toIssueLabels(issue.labels ?? []),
    number: issue.number ?? 0,
    state: issue.state === 'closed' ? 'closed' : 'open',
    title: issue.title ?? 'Untitled issue',
    updatedAt: issue.updated_at ?? '',
  }
}
