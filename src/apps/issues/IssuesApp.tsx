import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitPullRequestDraft,
  Github,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { openExternalLink } from '@/apps/github/format'
import {
  osAppHeight,
  osAppShellClass,
  osInputClass,
  osPanelBareClass,
} from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

import { createProjectIssue, getGithubIssueUser } from './issuesData'
import type { GithubIssueUser, IssuesBoardData, ProjectIssue } from './types'

type IssuesAppProps = {
  data: IssuesBoardData | null
  error: string | null
  loading: boolean
  onIssueCreated: (issue: ProjectIssue) => void
  onRefresh: () => void
}

type IssueColumn = {
  id: 'backlog' | 'active' | 'done'
  title: string
  icon: ComponentType<{ 'aria-hidden': true; size: number }>
  issues: ProjectIssue[]
}

export const IssuesApp = memo(function IssuesApp({
  data,
  error,
  loading,
  onIssueCreated,
  onRefresh,
}: IssuesAppProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authUser, setAuthUser] = useState<GithubIssueUser | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const columns = useMemo(() => buildColumns(data?.issues ?? []), [data])
  const openIssueCount = data?.issues.filter((issue) => issue.state === 'open').length ?? 0

  useEffect(() => {
    if (!data && !loading && !error) onRefresh()
  }, [data, error, loading, onRefresh])

  useEffect(() => {
    setAuthError(null)
    setAuthLoading(true)
    getGithubIssueUser()
      .then((user) => {
        setAuthUser(user)
      })
      .catch((caught: unknown) => {
        setAuthError(caught instanceof Error ? caught.message : 'Could not check GitHub sign-in.')
      })
      .finally(() => {
        setAuthLoading(false)
      })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authUser) {
      setSubmitError('Sign in with GitHub before creating an issue.')
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    try {
      const issue = await createProjectIssue({
        data: {
          body,
          title,
        },
      })

      setTitle('')
      setBody('')
      onIssueCreated(issue)
    } catch (caught: unknown) {
      setSubmitError(caught instanceof Error ? caught.message : 'Could not create the issue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={cn(osAppShellClass, osAppHeight.tall)} aria-label="GitHub issue tracker">
      <div className="flex items-center justify-between gap-4 border-b border-os-border bg-[#eef0ff]/90 px-4 py-3">
        <div className="min-w-0">
          <p className="m-0 text-caption font-black tracking-[0.14em] text-[#515bd4]">ISSUES</p>
          <strong className="block truncate text-[0.95rem]">
            {data?.repository.fullName ?? 'fewhnhouse/website'}
          </strong>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-os-border bg-white/74 px-2.5 py-1.5 text-meta font-extrabold text-os-ink"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw aria-hidden="true" size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)] gap-4 overflow-auto p-4 [scrollbar-color:rgba(111,124,255,0.42)_transparent] max-lg:grid-cols-1">
        <aside className={cn(osPanelBareClass, 'h-max p-4')}>
          <header className="mb-3">
            <h2 className="m-0 text-[1.12rem] tracking-normal">New issue</h2>
            <p className="mt-1 mb-0 text-meta leading-relaxed text-os-ink-muted">
              Got any ideas how to improve FelixOS? Sign in with GitHub below to create an issue!
            </p>
          </header>

          <GithubAuthPanel error={authError} loading={authLoading} user={authUser} />

          <form className="mt-3 grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Title
              <input
                className={osInputClass}
                maxLength={160}
                minLength={4}
                onChange={(event) => setTitle(event.currentTarget.value)}
                placeholder="Short, specific title"
                required
                disabled={!authUser || submitting}
                value={title}
              />
            </label>
            <label className="grid gap-1.5 text-caption font-black text-os-ink-muted">
              Details
              <textarea
                className={cn(osInputClass, 'min-h-32 resize-y leading-relaxed')}
                maxLength={4000}
                onChange={(event) => setBody(event.currentTarget.value)}
                placeholder="What should change, and why?"
                disabled={!authUser || submitting}
                value={body}
              />
            </label>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-ring/70 bg-ring px-3 py-2 text-sm font-black text-white shadow-chip disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!authUser || submitting}
            >
              <Plus aria-hidden="true" size={16} />
              {submitting ? 'Creating...' : 'Create issue'}
            </button>
          </form>

          {submitError ? <Notice>{submitError}</Notice> : null}
          {error ? <Notice>{error}</Notice> : null}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Open" value={openIssueCount} />
            <Metric label="Total" value={data?.issues.length ?? 0} />
            <Metric label="Done" value={columns.find((column) => column.id === 'done')?.issues.length ?? 0} />
          </div>
        </aside>

        <div className="min-w-0">
          {loading && !data ? (
            <div
              className={cn(
                osPanelBareClass,
                'mb-4 flex items-center gap-3 p-3.5 font-extrabold text-os-ink-muted',
              )}
            >
              <span className="size-3.5 animate-spin rounded-full border-2 border-os-border border-t-[#6f7cff]" />
              Loading GitHub issues...
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-1">
            {columns.map((column) => (
              <IssueColumnPanel key={column.id} column={column} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

function buildColumns(issues: ProjectIssue[]): IssueColumn[] {
  const activeNames = new Set(['status: in progress', 'in progress', 'active'])
  const backlog: ProjectIssue[] = []
  const active: ProjectIssue[] = []
  const done: ProjectIssue[] = []

  issues.forEach((issue) => {
    if (issue.state === 'closed') {
      done.push(issue)
      return
    }

    if (issue.labels.some((label) => activeNames.has(label.name.toLowerCase()))) {
      active.push(issue)
      return
    }

    backlog.push(issue)
  })

  return [
    { id: 'backlog', title: 'Open', icon: AlertCircle, issues: backlog },
    { id: 'active', title: 'In progress', icon: GitPullRequestDraft, issues: active },
    { id: 'done', title: 'Done', icon: CheckCircle2, issues: done },
  ]
}

function GithubAuthPanel({
  error,
  loading,
  user,
}: {
  error: string | null
  loading: boolean
  user: GithubIssueUser | null
}) {
  if (loading) {
    return (
      <div className="rounded-card border border-os-border bg-white/54 p-3 text-meta font-extrabold text-os-ink-muted">
        Checking GitHub sign-in...
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-card border border-os-border bg-white/64 p-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {user.avatarUrl ? (
            <img
              className="size-7 rounded-full border border-os-border"
              src={user.avatarUrl}
              alt=""
            />
          ) : (
            <span className="grid size-7 place-items-center rounded-full border border-os-border bg-white">
              <Github aria-hidden="true" size={15} />
            </span>
          )}
          <span className="min-w-0 text-meta font-black text-os-ink">
            Signed in as <span className="truncate">@{user.login}</span>
          </span>
        </div>
        <a
          className="shrink-0 rounded-md border border-os-border bg-white/74 px-2 py-1 text-caption font-black text-os-ink-muted no-underline"
          href="/api/github/logout"
        >
          Sign out
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-card border border-os-border bg-white/64 p-3 shadow-chip">
      <div className="mb-2.5 flex items-start gap-2">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-os-border bg-white/80 text-[#24292f]">
          <Github aria-hidden="true" size={15} />
        </span>
        <div className="min-w-0">
          <strong className="block text-sm leading-snug text-os-ink">GitHub sign-in required</strong>
          <p className="mt-0.5 mb-0 text-meta font-bold leading-relaxed text-os-ink-muted">
            Submit issues with your GitHub account.
          </p>
        </div>
      </div>
      <a
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-os-border bg-white px-3 py-2 text-sm font-black text-[#24292f] no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition hover:border-ring/60 hover:bg-[#f6f7ff] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
        href="/api/github/login"
      >
        <Github aria-hidden="true" size={16} />
        Sign in with GitHub
      </a>
      {error ? <p className="mt-2 mb-0 text-caption font-bold text-destructive">{error}</p> : null}
    </div>
  )
}

function IssueColumnPanel({ column }: { column: IssueColumn }) {
  const Icon = column.icon

  return (
    <section className="min-w-0">
      <header className="mb-2 flex items-center justify-between gap-3 rounded-card border border-os-border bg-white/62 px-3 py-2">
        <h3 className="m-0 inline-flex min-w-0 items-center gap-2 text-sm tracking-normal">
          <Icon aria-hidden={true} size={16} />
          <span className="truncate">{column.title}</span>
        </h3>
        <span className="rounded-control border border-os-border bg-white/76 px-2 py-1 text-caption font-black text-os-ink-muted">
          {column.issues.length}
        </span>
      </header>
      <div className="grid gap-2.5">
        {column.issues.length > 0 ? (
          column.issues.map((issue) => <IssueCard key={issue.number} issue={issue} />)
        ) : (
          <div className="rounded-card border border-dashed border-os-border bg-white/38 p-3 text-meta font-bold text-os-ink-soft">
            No issues here.
          </div>
        )}
      </div>
    </section>
  )
}

function IssueCard({ issue }: { issue: ProjectIssue }) {
  return (
    <article className={cn(osPanelBareClass, 'p-3')}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="m-0 min-w-0 text-sm leading-snug tracking-normal">{issue.title}</h4>
        <a
          className="grid size-7 shrink-0 place-items-center rounded-md border border-os-border bg-white/74 text-os-ink-muted"
          href={issue.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openExternalLink}
          aria-label={`Open issue #${issue.number} on GitHub`}
        >
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </div>
      <p className="my-0 line-clamp-3 text-meta leading-relaxed text-os-ink-muted">
        {issue.body?.trim() || 'No description.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <IssuePill>#{issue.number}</IssuePill>
        <IssuePill>{issue.comments} comments</IssuePill>
        {issue.labels.slice(0, 3).map((label) => (
          <span
            key={label.name}
            className="rounded-full border px-2 py-1 text-caption font-black"
            style={{
              backgroundColor: `#${label.color}24`,
              borderColor: `#${label.color}66`,
              color: '#243042',
            }}
          >
            {label.name}
          </span>
        ))}
      </div>
    </article>
  )
}

function IssuePill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-os-border bg-white/70 px-2 py-1 text-caption font-black text-os-ink-muted">
      {children}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-os-border bg-white/60 px-2.5 py-2">
      <span className="block text-caption font-extrabold text-os-ink-soft">{label}</span>
      <strong className="block text-base">{value}</strong>
    </div>
  )
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-card border border-destructive/20 bg-destructive-foreground p-3 text-meta font-extrabold leading-relaxed text-destructive">
      {children}
    </div>
  )
}
