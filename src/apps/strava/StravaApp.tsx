import { Activity, Bike, Clock3, Flame, MapPinned, RotateCw, Trophy } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

import type { StravaActivity, StravaDataResult, StravaTotals } from './stravaData'

const panelClass = 'rounded-xl border border-[#fc4c02]/25 bg-white/[0.06] p-4'
const mutedTextClass = 'text-[#d7d7d1]/70'
const metricCardClass =
  'rounded-xl border border-[#fc4c02]/25 bg-[linear-gradient(145deg,rgba(252,76,2,0.22),rgba(255,255,255,0.06))] p-4'

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value)
}

function formatDate(value: string) {
  if (!value) return 'Unknown date'

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function formatSportType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function sportIconClassName(value: string) {
  const normalized = value.toLowerCase()
  const base = 'grid h-10 w-10 shrink-0 place-items-center rounded-xl border'

  if (normalized.includes('run')) return `${base} border-emerald-300/30 bg-emerald-300/15 text-emerald-200`
  if (normalized.includes('bike') || normalized.includes('ride')) {
    return `${base} border-[#fc4c02]/40 bg-[#fc4c02]/20 text-[#ff9a66]`
  }
  if (normalized.includes('ski')) return `${base} border-sky-300/35 bg-sky-300/15 text-sky-200`

  return `${base} border-white/20 bg-white/10 text-white`
}

function StatTile({ label, totals }: { label: string; totals: StravaTotals }) {
  return (
    <article className="rounded-lg border border-white/10 bg-black/20 p-3">
      <span className={`block text-[0.72rem] font-extrabold uppercase tracking-[0.12em] ${mutedTextClass}`}>
        {label}
      </span>
      <strong className="mt-1 block text-lg text-white">{formatNumber(totals.distanceKm)} km</strong>
      <small className={`mt-1 block text-[0.72rem] font-bold ${mutedTextClass}`}>
        {formatNumber(totals.activities)} activities / {formatNumber(totals.elevationMeters)} m
      </small>
    </article>
  )
}

function ActivityRow({ activity }: { activity: StravaActivity }) {
  return (
    <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className={sportIconClassName(activity.sportType)}>
        <Activity aria-hidden="true" size={18} />
      </div>
      <div className="min-w-0">
        <header className="flex items-start justify-between gap-3">
          <h3 className="m-0 line-clamp-2 text-sm font-extrabold text-white">{activity.name}</h3>
          <span className={`shrink-0 text-[0.72rem] font-bold ${mutedTextClass}`}>
            {formatDate(activity.startedAt)}
          </span>
        </header>
        <p className={`mt-1 mb-2 text-[0.76rem] font-bold ${mutedTextClass}`}>
          {formatSportType(activity.sportType)}
        </p>
        <footer className={`flex flex-wrap gap-2 text-[0.72rem] font-bold ${mutedTextClass}`}>
          <span>{activity.distanceKm} km</span>
          <span>{activity.elevationMeters} m</span>
          <span>{activity.movingMinutes} min</span>
          {activity.averageSpeedKmh ? <span>{activity.averageSpeedKmh} km/h</span> : null}
        </footer>
      </div>
    </article>
  )
}

export function StravaApp({
  error,
  loading,
  onRefresh,
  result,
}: {
  error: string | null
  loading: boolean
  onRefresh: () => void
  result: StravaDataResult | null
}) {
  const data = result?.status === 'ready' ? result.data : null
  const yearDistance = data
    ? data.totals.yearRide.distanceKm + data.totals.yearRun.distanceKm
    : 0
  const yearElevation = data
    ? data.totals.yearRide.elevationMeters + data.totals.yearRun.elevationMeters
    : 0

  return (
    <section
      className="flex min-h-0 flex-1 flex-col bg-[#111] text-[#f7f7f4] [max-height:calc(min(700px,calc(100svh_-_7.25rem))_-_42px)] [.os-window--maximized_&]:[max-height:calc(100svh_-_174px)]"
      aria-label="Strava live data"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#fc4c02]/30 bg-[#171717] px-4 py-3">
        <div>
          <p className="m-0 text-[0.72rem] font-black tracking-[0.14em] text-[#fc4c02]">STRAVA</p>
          <strong className="block text-[0.95rem]">{data ? data.athlete.name : 'Athlete dashboard'}</strong>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#fc4c02]/35 bg-[#fc4c02] px-2.5 py-1.5 text-[0.78rem] font-extrabold text-white"
          onClick={onRefresh}
          aria-label="Refresh Strava data"
        >
          <RotateCw aria-hidden="true" size={15} />
          Refresh
        </button>
      </div>

      {loading ? (
        <StatusPanel>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-[#fc4c02]" />
          Syncing Strava data...
        </StatusPanel>
      ) : null}

      {error ? (
        <ErrorPanel title="Could not load Strava data." message={error} />
      ) : null}

      {result?.status === 'missing_config' ? (
        <ErrorPanel
          title="Missing Strava configuration."
          message={`Set ${result.missing.join(', ')} in the backend environment.`}
        />
      ) : null}

      {data ? (
        <div className="min-h-0 flex-1 overflow-auto p-4 [scrollbar-color:rgba(252,76,2,0.42)_transparent]">
          <header className="mb-4 grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3.5 max-sm:grid-cols-1">
            {data.athlete.avatarUrl ? (
              <img
                className="aspect-square w-[4.5rem] rounded-full border border-[#fc4c02]/35 object-cover"
                src={data.athlete.avatarUrl}
                alt={data.athlete.name}
              />
            ) : null}
            <div>
              <p className="m-0 text-[0.72rem] font-black tracking-[0.14em] text-[#fc4c02]">
                Live from Strava
              </p>
              <h2 className="m-0 text-[1.4rem] tracking-normal text-white">{data.athlete.name}</h2>
              {data.athlete.location ? (
                <span className={`mt-1 inline-flex items-center gap-1 text-sm font-bold ${mutedTextClass}`}>
                  <MapPinned aria-hidden="true" size={15} />
                  {data.athlete.location}
                </span>
              ) : null}
            </div>
            <a
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-extrabold text-white no-underline hover:text-white"
              href={data.athlete.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Profile
            </a>
          </header>

          <section className="mb-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1" aria-label="Year to date training totals">
            <HeroStat icon={Bike} label="YTD Distance" value={`${formatNumber(yearDistance)} km`} />
            <HeroStat icon={Trophy} label="YTD Elevation" value={`${formatNumber(yearElevation)} m`} />
            <HeroStat
              icon={Clock3}
              label="YTD Moving Time"
              value={`${formatNumber(data.totals.yearRide.movingHours + data.totals.yearRun.movingHours)} h`}
            />
            <HeroStat
              icon={Flame}
              label="Last 4 Weeks"
              value={`${formatNumber(data.totals.recentRide.distanceKm + data.totals.recentRun.distanceKm)} km`}
            />
          </section>

          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <section className={panelClass}>
              <h3 className="mt-0 mb-3 text-base text-white">Training totals</h3>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <StatTile label="All rides" totals={data.totals.allRide} />
                <StatTile label="All runs" totals={data.totals.allRun} />
                <StatTile label="Recent rides" totals={data.totals.recentRide} />
                <StatTile label="Recent runs" totals={data.totals.recentRun} />
              </div>
            </section>

            <section className={panelClass}>
              <h3 className="mt-0 mb-3 text-base text-white">Recent activities</h3>
              <div className="grid gap-2.5">
                {data.recentActivities.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function StatusPanel({ children }: { children: ReactNode }) {
  return (
    <div className="m-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 font-extrabold text-[#d7d7d1]">
      {children}
    </div>
  )
}

function ErrorPanel({ message, title }: { message: string; title: string }) {
  return (
    <div className="m-4 flex flex-col items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-4 font-extrabold text-red-200">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  )
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ 'aria-hidden': true; size: number }>
  label: string
  value: string
}) {
  return (
    <article className={metricCardClass}>
      <Icon aria-hidden={true} size={20} />
      <span className={`mt-3 block text-[0.72rem] font-black uppercase tracking-[0.12em] ${mutedTextClass}`}>
        {label}
      </span>
      <strong className="mt-1 block text-xl text-white">{value}</strong>
    </article>
  )
}
