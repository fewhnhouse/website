import { GitFork, Star } from '@/components/PixelIcon'
import { memo } from 'react'
import type { ReactNode } from 'react'

import { osBtnSmClass, osChipClass, osScrollClass } from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

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

// Contribution cells stay 1px-bordered (a stamped 2px border on every cell
// would visually drown the grid). The ramp goes sand → coral-soft → coral
// → coral-deep so the whole graph reads as a single warm gradient.
const contributionCellClass = (level: number | 'empty') => {
  const base = 'inline-block size-[0.58rem] border border-ink/25'

  if (level === 'empty') return `${base} bg-sand opacity-55`

  return `${base} ${
    level === 0
      ? 'bg-sand'
      : level === 1
        ? 'bg-[#DAD3F7]'
        : level === 2
          ? 'bg-[#9B82E8]'
          : level === 3
            ? 'bg-[#4B37D6]'
            : 'bg-[#3826B0]'
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
      className="flex min-h-0 flex-1 flex-col text-ink [max-height:calc(min(680px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:max-h-none"
      aria-label="GitHub live data"
    >
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">GITHUB</p>
          <strong
            className={
              data
                ? 'os-section-header__title os-section-header__title--mono'
                : 'os-section-header__title'
            }
          >
            {data ? `@${data.user.login}` : 'Loading GitHub profile'}
          </strong>
        </div>
        <button type="button" className={osBtnSmClass} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="m-4 flex items-center gap-3 os-panel font-extrabold text-ink">
          <span className="size-3.5 animate-spin border-2 border-ink border-t-lagoon" />
          Loading live GitHub data...
        </div>
      ) : null}

      {error ? (
        <div className="m-4 flex flex-col items-start gap-3 os-panel border-destructive bg-destructive-foreground font-extrabold text-destructive">
          <strong>Could not load GitHub data.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {data ? (
        <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
          <header className="mb-4 grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3.5 max-sm:grid-cols-1">
            <img
              className="aspect-square w-[4.5rem] border-2 border-ink [box-shadow:4px_4px_0_0_var(--lagoon)] max-sm:w-16"
              src={data.user.avatar_url}
              alt={data.user.login}
            />
            <div>
              <p className="m-0 text-caption font-black uppercase tracking-[0.14em] text-lagoon-deep">
                {profileMeta || 'GitHub profile'}
              </p>
              <h2 className="m-0 font-display text-[1.4rem] font-normal lowercase tracking-normal text-ink">
                {data.user.name ?? data.user.login}
              </h2>
              <a
                className="font-mono text-meta font-extrabold text-lagoon-deep no-underline hover:text-ink"
                href={data.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openExternalLink}
              >
                @{data.user.login}
              </a>
              <div className="mt-2 flex flex-wrap gap-2">
                <GithubStat value={formatNumber(data.user.public_repos)} label="repos" />
                <GithubStat value={formatNumber(data.user.followers)} label="followers" />
                <GithubStat value={formatNumber(data.user.following)} label="following" />
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
  return <span className={osChipClass}>{children}</span>
}

function GithubStat({ label, value }: { label: string; value: string }) {
  return (
    <span className={cn(osChipClass, 'gap-1.5')}>
      <span className="font-mono text-[0.72rem] font-bold normal-case tracking-normal text-ink">
        {value}
      </span>
      <span>{label}</span>
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
    <section className="mb-4 os-panel px-3.5 pt-3 pb-2.5">
      <div className="mb-3 flex items-baseline justify-between gap-4 max-sm:flex-col max-sm:gap-1">
        <h3 className="m-0 flex items-baseline gap-2 text-[0.98rem] font-extrabold text-ink">
          {data.contributions.available && data.contributions.totalContributions !== null ? (
            <>
              <span className="font-mono text-ink">
                {formatNumber(data.contributions.totalContributions)}
              </span>
              <span className="text-meta font-bold text-ink-soft">contributions / past year</span>
            </>
          ) : (
            'Contribution graph'
          )}
        </h3>
        <span className="font-display text-caption font-normal uppercase tracking-[0.08em] text-lagoon-deep">
          {data.contributions.available
            ? 'Live · GraphQL'
            : 'Set GITHUB_PERSONAL_ACCESS_TOKEN to enable'}
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="mb-1 ml-[2.35rem] grid min-w-max grid-cols-[repeat(53,0.58rem)] gap-[0.16rem] text-[0.68rem] leading-none text-ink">
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
          <div className="grid w-[1.94rem] grid-rows-[repeat(7,0.58rem)] gap-[0.16rem] text-right text-[0.68rem] leading-[0.58rem] text-ink">
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
      <div className="mt-2 flex items-center justify-end gap-1 text-caption text-ink-soft">
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
      <h3 className="mt-0 mb-2.5 font-display text-[0.92rem] font-normal uppercase tracking-[0.08em] text-lagoon-deep">
        {title}
      </h3>
      <div className="grid gap-2.5">
        {repos.map((repo) => (
          <article key={repo.full_name} className="os-panel p-3">
            <div className="flex items-center justify-between gap-2">
              <a
                className="font-mono text-meta font-extrabold text-lagoon-deep no-underline hover:text-ink"
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openExternalLink}
              >
                {repo.full_name}
              </a>
              {repo.private ? <GithubPill>Private</GithubPill> : null}
            </div>
            <p className="mt-2 mb-2.5 min-h-10 text-meta leading-relaxed text-ink-soft">
              {repo.description || 'No description yet.'}
            </p>
            <footer className="flex flex-wrap gap-2.5 text-caption font-bold text-ink-soft">
              {repo.language ? (
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 border border-ink bg-lagoon" />
                  <span className="font-mono">{repo.language}</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden="true" size={13} />
                <span className="font-mono">{formatNumber(repo.stargazers_count)}</span>
              </span>
              {'forks_count' in repo && typeof repo.forks_count === 'number' ? (
                <span className="inline-flex items-center gap-1">
                  <GitFork aria-hidden="true" size={13} />
                  <span className="font-mono">{formatNumber(repo.forks_count)}</span>
                </span>
              ) : null}
              <span className="font-mono">{formatDate(repo.updated_at)}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
