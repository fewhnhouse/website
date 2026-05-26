import { Activity, Bike, Clock3, Flame, MapPinned, RotateCw, Trophy } from '@/components/PixelIcon'
import type { ComponentType, ReactNode } from 'react'

import {
  osAppHeight,
  osAppShellClass,
  osBtnSmClass,
  osPanelClass,
  osScrollClass,
} from '@/apps/shared/appStyles'
import { cn } from '@/lib/cn'

import type { StravaActivity, StravaDataResult, StravaTotals } from './stravaData'

const metricCardClass = 'os-panel grid gap-1'
const statTileClass = 'os-panel--bare p-3'
const activityRowClass = 'os-panel--bare grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 p-3'

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

function sportIconClassName() {
  return 'grid h-10 w-10 shrink-0 place-items-center border-2 border-ink bg-lagoon text-ink'
}

function StatTile({ label, totals }: { label: string; totals: StravaTotals }) {
  return (
    <article className={statTileClass}>
      <span className="block text-caption font-black uppercase tracking-[0.12em] text-lagoon-deep">
        {label}
      </span>
      <strong className="mt-1 block text-lg font-mono text-ink">
        {formatNumber(totals.distanceKm)} km
      </strong>
      <small className="mt-1 block text-caption font-bold text-ink-soft">
        {formatNumber(totals.activities)} activities · {formatNumber(totals.elevationMeters)} m
      </small>
    </article>
  )
}

function ActivityRow({ activity }: { activity: StravaActivity }) {
  return (
    <article className={activityRowClass}>
      <div className={sportIconClassName()}>
        <Activity aria-hidden="true" size={18} />
      </div>
      <div className="min-w-0">
        <header className="flex items-start justify-between gap-3">
          <h3 className="m-0 line-clamp-2 text-sm font-extrabold text-ink">{activity.name}</h3>
          <span className="shrink-0 font-mono text-caption font-bold text-ink-soft">
            {formatDate(activity.startedAt)}
          </span>
        </header>
        <p className="mt-1 mb-2 text-[0.76rem] font-bold text-ink-soft">
          {formatSportType(activity.sportType)}
        </p>
        <footer className="flex flex-wrap gap-2 text-caption font-mono text-ink">
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
      className={cn(osAppShellClass, osAppHeight.tall, 'bg-bg-base text-ink')}
      aria-label="Strava live data"
    >
      <div className="os-section-header">
        <div>
          <p className="os-section-header__kicker">STRAVA</p>
          <strong className="os-section-header__title">
            {data ? data.athlete.name : 'Athlete dashboard'}
          </strong>
        </div>
        <button
          type="button"
          className={osBtnSmClass}
          onClick={onRefresh}
          aria-label="Refresh Strava data"
        >
          <RotateCw aria-hidden="true" size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <StatusPanel>
          <span className="size-3.5 animate-spin rounded-none border-2 border-ink border-t-lagoon" />
          Syncing Strava data...
        </StatusPanel>
      ) : null}

      {error ? <ErrorPanel title="Could not load Strava data." message={error} /> : null}

      {result?.status === 'missing_config' ? (
        <ErrorPanel
          title="Missing Strava configuration."
          message={`Set ${result.missing.join(', ')} in the backend environment.`}
        />
      ) : null}

      {data ? (
        <div className={cn('min-h-0 flex-1 overflow-auto p-4', osScrollClass)}>
          <header className="mb-4 grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3.5 max-sm:grid-cols-1">
            {data.athlete.avatarUrl ? (
              <img
                className="aspect-square w-[4.5rem] border-2 border-ink object-cover shadow-chip"
                src={data.athlete.avatarUrl}
                alt={data.athlete.name}
              />
            ) : null}
            <div>
              <p className="m-0 text-caption font-black tracking-[0.14em] text-lagoon-deep">
                LIVE FROM STRAVA
              </p>
              <h2 className="m-0 font-display text-[1.4rem] font-normal lowercase tracking-normal text-ink">
                {data.athlete.name}
              </h2>
              {data.athlete.location ? (
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-ink-soft">
                  <MapPinned aria-hidden="true" size={15} />
                  {data.athlete.location}
                </span>
              ) : null}
            </div>
            <a
              className={osBtnSmClass}
              href={data.athlete.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Profile
            </a>
          </header>

          <section
            className="mb-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
            aria-label="Year to date training totals"
          >
            <HeroStat icon={Bike} label="YTD Distance" value={`${formatNumber(yearDistance)} km`} />
            <HeroStat
              icon={Trophy}
              label="YTD Elevation"
              value={`${formatNumber(yearElevation)} m`}
            />
            <HeroStat
              icon={Clock3}
              label="YTD Moving Time"
              value={`${formatNumber(
                data.totals.yearRide.movingHours + data.totals.yearRun.movingHours,
              )} h`}
            />
            <HeroStat
              icon={Flame}
              label="Last 4 Weeks"
              value={`${formatNumber(
                data.totals.recentRide.distanceKm + data.totals.recentRun.distanceKm,
              )} km`}
            />
          </section>

          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <section className={osPanelClass}>
              <h3 className="mt-0 mb-3 text-base font-extrabold text-ink">Training totals</h3>
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <StatTile label="All rides" totals={data.totals.allRide} />
                <StatTile label="All runs" totals={data.totals.allRun} />
                <StatTile label="Recent rides" totals={data.totals.recentRide} />
                <StatTile label="Recent runs" totals={data.totals.recentRun} />
              </div>
            </section>

            <section className={osPanelClass}>
              <h3 className="mt-0 mb-3 text-base font-extrabold text-ink">Recent activities</h3>
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
    <div className="m-4 flex items-center gap-3 os-panel font-extrabold text-ink">{children}</div>
  )
}

function ErrorPanel({ message, title }: { message: string; title: string }) {
  return (
    <div className="m-4 flex flex-col items-start gap-2 os-panel border-destructive bg-destructive-foreground font-extrabold text-destructive">
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
      <span className="mt-2 block text-caption font-black uppercase tracking-[0.12em] text-lagoon-deep">
        {label}
      </span>
      <strong className="mt-1 block text-xl font-mono text-ink">{value}</strong>
    </article>
  )
}
