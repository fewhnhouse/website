import { GitFork, Star } from 'lucide-react'
import { memo } from 'react'
import type { ReactNode } from 'react'

import {
  buildContributionCalendar,
  contributionLevel,
  formatDate,
  formatGithubCompany,
  formatGithubLocation,
  formatNumber,
  openExternalLink,
} from './format'
import type { GithubData, GithubRepo } from './types'

type GithubAppProps = {
  data: GithubData | null
  error: string | null
  loading: boolean
  onRefresh: () => void
}

const contributionCellClass = (level: number | 'empty') => {
  const base = 'inline-block size-[0.58rem] rounded-[2px] border border-black/5'

  if (level === 'empty') return `${base} bg-[#ebedf0] opacity-55`

  return `${base} ${
    level === 0
      ? 'bg-[#ebedf0]'
      : level === 1
        ? 'bg-[#9be9a8]'
        : level === 2
          ? 'bg-[#40c463]'
          : level === 3
            ? 'bg-[#30a14e]'
            : 'bg-[#216e39]'
  }`
}

export const GithubApp = memo(function GithubApp({
  data,
  error,
  loading,
  onRefresh,
}: GithubAppProps) {
  const contributionCalendar = buildContributionCalendar(data?.contributions.days ?? [])
  const profileMeta = data
    ? [formatGithubCompany(data.user.company), formatGithubLocation(data.user.location)]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <section
      className="flex min-h-0 flex-1 flex-col text-github-ink [max-height:calc(min(680px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:max-h-none"
      aria-label="GitHub live data"
    >
      <div className="flex items-center justify-between gap-4 border-b border-github-border bg-github-surface/90 px-3.5 py-2.5">
        <div>
          <p className="m-0 text-caption font-extrabold text-github-muted">GitHub</p>
          <strong className="block text-[0.92rem]">
            {data ? `@${data.user.login}` : 'Loading GitHub profile'}
          </strong>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-md border border-github-border bg-github-surface px-2.5 py-1.5 text-meta font-extrabold text-github-ink"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="m-4 flex items-center gap-3 rounded-lg border border-github-border bg-github-panel p-3.5 font-extrabold text-github-muted">
          <span className="size-3.5 animate-spin rounded-full border-2 border-github-border border-t-github-link" />
          Loading live GitHub data...
        </div>
      ) : null}

      {error ? (
        <div className="m-4 flex flex-col items-start gap-3 rounded-lg border border-[#ffebe9] bg-[#fff8f7] p-3.5 font-extrabold text-github-danger">
          <strong>Could not load GitHub data.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {data ? (
        <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-color:rgba(9,105,218,0.42)_transparent]">
          <header className="mb-4 grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3.5 max-sm:grid-cols-1">
            <img
              className="aspect-square w-[4.5rem] rounded-full border border-github-border max-sm:w-16"
              src={data.user.avatar_url}
              alt={data.user.login}
            />
            <div>
              <h2 className="m-0 text-[1.4rem] tracking-normal">{data.user.name ?? data.user.login}</h2>
              <a
                className="font-extrabold text-github-link no-underline"
                href={data.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openExternalLink}
              >
                @{data.user.login}
              </a>
              {profileMeta ? (
                <p className="mt-1 mb-0 text-window font-bold text-github-muted">{profileMeta}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <GithubPill>{formatNumber(data.user.public_repos)} repos</GithubPill>
                <GithubPill>{formatNumber(data.user.followers)} followers</GithubPill>
                <GithubPill>{formatNumber(data.user.following)} following</GithubPill>
              </div>
            </div>
          </header>

          <ContributionPanel data={data} contributionCalendar={contributionCalendar} />

          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <RepoList title="Recently updated" repos={data.recentRepos} />
            <RepoList title="Starred" repos={data.starredRepos} />
          </div>
        </div>
      ) : null}
    </section>
  )
})

function GithubPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-github-border bg-github-panel px-2 py-1 text-caption font-extrabold text-github-muted">
      {children}
    </span>
  )
}

function ContributionPanel({
  contributionCalendar,
  data,
}: {
  contributionCalendar: ReturnType<typeof buildContributionCalendar>
  data: GithubData
}) {
  return (
    <section className="mb-4 rounded-lg border border-github-border bg-github-panel px-3.5 pt-3 pb-2.5">
      <div className="mb-3 flex items-baseline justify-between gap-4 max-sm:flex-col max-sm:gap-1">
        <h3 className="m-0 text-[0.98rem]">
          {data.contributions.available && data.contributions.totalContributions !== null
            ? `${formatNumber(data.contributions.totalContributions)} contributions in the last year`
            : 'Contribution graph'}
        </h3>
        <span className="text-caption font-bold text-github-muted">
          {data.contributions.available
            ? 'Live from GitHub GraphQL'
            : 'Set GITHUB_PERSONAL_ACCESS_TOKEN on Vercel to enable this graph'}
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="mb-1 ml-[2.35rem] grid min-w-max grid-cols-[repeat(53,0.58rem)] gap-[0.16rem] text-[0.68rem] leading-none text-github-ink">
          {contributionCalendar.monthLabels.map((month) => (
            <span
              key={`${month.label}-${month.column}`}
              className="whitespace-nowrap"
              style={{ gridColumnStart: month.column + 1 }}
            >
              {month.label}
            </span>
          ))}
        </div>
        <div className="flex min-w-max items-start gap-[0.42rem]">
          <div className="grid w-[1.94rem] grid-rows-[repeat(7,0.58rem)] gap-[0.16rem] text-right text-[0.68rem] leading-[0.58rem] text-github-ink">
            <span style={{ gridRowStart: 2 }}>Mon</span>
            <span style={{ gridRowStart: 4 }}>Wed</span>
            <span style={{ gridRowStart: 6 }}>Fri</span>
          </div>
          <div
            className="grid min-w-max auto-cols-[0.58rem] grid-flow-col grid-rows-[repeat(7,0.58rem)] gap-[0.16rem]"
            aria-label="GitHub contribution calendar"
          >
            {contributionCalendar.days.map((day) => {
              const isPlaceholder = day.date.startsWith('placeholder-')

              return (
                <span
                  key={day.date}
                  className={contributionCellClass(
                    isPlaceholder ? 'empty' : contributionLevel(day.contributionCount),
                  )}
                  title={
                    isPlaceholder ? undefined : `${day.contributionCount} contributions on ${day.date}`
                  }
                />
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-caption text-github-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <i key={level} className={contributionCellClass(level)} />
        ))}
        <span>More</span>
      </div>
    </section>
  )
}

function RepoList({ repos, title }: { repos: GithubRepo[]; title: string }) {
  return (
    <section>
      <h3 className="mt-0 mb-2.5 text-[0.98rem]">{title}</h3>
      <div className="grid gap-2.5">
        {repos.map((repo) => (
          <article key={repo.full_name} className="rounded-lg border border-github-border bg-github-panel p-3">
            <div className="flex items-center justify-between gap-2">
              <a
                className="font-extrabold text-github-link no-underline"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openExternalLink}
              >
                {repo.full_name}
              </a>
              {repo.private ? <GithubPill>Private</GithubPill> : null}
            </div>
            <p className="mt-2 mb-2.5 min-h-10 text-meta leading-relaxed text-github-muted">
              {repo.description || 'No description yet.'}
            </p>
            <footer className="flex flex-wrap gap-2.5 text-caption font-bold text-github-muted">
              {repo.language ? (
                <span className="inline-flex items-center gap-1">
                  <i className="h-2.5 w-2.5 rounded-full bg-[#3178c6]" />
                  {repo.language}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden="true" size={13} />
                {formatNumber(repo.stargazers_count)}
              </span>
              {'forks_count' in repo && typeof repo.forks_count === 'number' ? (
                <span className="inline-flex items-center gap-1">
                  <GitFork aria-hidden="true" size={13} />
                  {formatNumber(repo.forks_count)}
                </span>
              ) : null}
              <span>Updated {formatDate(repo.updated_at)}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
