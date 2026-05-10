export type IssueLabel = {
  color: string
  name: string
}

export type IssueState = 'open' | 'closed'

export type ProjectIssue = {
  author: {
    avatarUrl: string
    login: string
    url: string
  } | null
  body: string | null
  comments: number
  createdAt: string
  htmlUrl: string
  labels: IssueLabel[]
  number: number
  state: IssueState
  title: string
  updatedAt: string
}

export type IssuesBoardData = {
  fetchedAt: string
  issues: ProjectIssue[]
  repository: {
    fullName: string
    htmlUrl: string
  }
}

export type CreateIssueInput = {
  body: string
  title: string
}

export type GithubIssueUser = {
  avatarUrl: string
  login: string
  url: string
}
