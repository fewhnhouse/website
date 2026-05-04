import { createServerFn } from '@tanstack/react-start'

const STRAVA_API_URL = 'https://www.strava.com/api/v3'
const STRAVA_CACHE_MS = 60 * 60 * 1000

type StravaAthleteResponse = {
  id: number
  firstname?: string
  lastname?: string
  username?: string | null
  city?: string | null
  country?: string | null
  profile?: string
}

type StravaActivityResponse = {
  id: number
  achievement_count?: number
  average_speed?: number
  distance?: number
  elapsed_time?: number
  kudos_count?: number
  moving_time?: number
  name: string
  sport_type?: string
  start_date?: string
  start_date_local?: string
  total_elevation_gain?: number
  type?: string
}

type StravaStatsResponse = {
  all_ride_totals?: StravaTotalsResponse
  all_run_totals?: StravaTotalsResponse
  recent_ride_totals?: StravaTotalsResponse
  recent_run_totals?: StravaTotalsResponse
  ytd_ride_totals?: StravaTotalsResponse
  ytd_run_totals?: StravaTotalsResponse
}

type StravaTotalsResponse = {
  achievement_count?: number
  count?: number
  distance?: number
  elapsed_time?: number
  elevation_gain?: number
  moving_time?: number
}

export type StravaActivity = {
  achievements: number
  averageSpeedKmh: number | null
  distanceKm: number
  elapsedMinutes: number
  elevationMeters: number
  id: number
  kudos: number
  movingMinutes: number
  name: string
  sportType: string
  startedAt: string
}

export type StravaTotals = {
  activities: number
  distanceKm: number
  elevationMeters: number
  movingHours: number
}

export type StravaData = {
  athlete: {
    avatarUrl: string | null
    id: number
    location: string
    name: string
    profileUrl: string
  }
  fetchedAt: string
  recentActivities: StravaActivity[]
  totals: {
    allRide: StravaTotals
    allRun: StravaTotals
    recentRide: StravaTotals
    recentRun: StravaTotals
    yearRide: StravaTotals
    yearRun: StravaTotals
  }
}

export type StravaDataResult =
  | {
      status: 'ready'
      data: StravaData
      cacheMaxAgeSeconds: number
      tokenStorage: 'env'
    }
  | {
      status: 'missing_config'
      missing: string[]
    }

let cachedResult: { expiresAt: number; result: Extract<StravaDataResult, { status: 'ready' }> } | null =
  null

function getStravaConfig() {
  const accessToken = process.env.STRAVA_OAUTH_ACCESS_TOKEN
  const clientId = process.env.STRAVA_OAUTH_CLIENT_ID
  const clientSecret = process.env.STRAVA_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_OAUTH_REFRESH_TOKEN
  const missing = [
    accessToken ? null : 'STRAVA_OAUTH_ACCESS_TOKEN',
    clientId ? null : 'STRAVA_OAUTH_CLIENT_ID',
    clientSecret ? null : 'STRAVA_OAUTH_CLIENT_SECRET',
    refreshToken ? null : 'STRAVA_OAUTH_REFRESH_TOKEN',
  ].filter((value): value is string => Boolean(value))

  return {
    accessToken,
    clientId,
    clientSecret,
    missing,
    refreshToken,
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return response.json() as Promise<T>

  const details = await response.text().catch(() => '')
  throw new Error(details ? `${fallbackMessage}: ${details}` : fallbackMessage)
}

async function getStravaApi<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${STRAVA_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseJsonResponse<T>(response, `Unable to load Strava ${path}`)
}

function toKilometers(meters = 0) {
  return Math.round((meters / 1000) * 10) / 10
}

function toHours(seconds = 0) {
  return Math.round((seconds / 3600) * 10) / 10
}

function toMinutes(seconds = 0) {
  return Math.round(seconds / 60)
}

function toSpeedKmh(metersPerSecond?: number) {
  if (!metersPerSecond) return null

  return Math.round(metersPerSecond * 3.6 * 10) / 10
}

function toTotals(totals?: StravaTotalsResponse): StravaTotals {
  return {
    activities: totals?.count ?? 0,
    distanceKm: toKilometers(totals?.distance),
    elevationMeters: Math.round(totals?.elevation_gain ?? 0),
    movingHours: toHours(totals?.moving_time),
  }
}

function toActivity(activity: StravaActivityResponse): StravaActivity {
  return {
    achievements: activity.achievement_count ?? 0,
    averageSpeedKmh: toSpeedKmh(activity.average_speed),
    distanceKm: toKilometers(activity.distance),
    elapsedMinutes: toMinutes(activity.elapsed_time),
    elevationMeters: Math.round(activity.total_elevation_gain ?? 0),
    id: activity.id,
    kudos: activity.kudos_count ?? 0,
    movingMinutes: toMinutes(activity.moving_time),
    name: activity.name,
    sportType: activity.sport_type ?? activity.type ?? 'Activity',
    startedAt: activity.start_date_local ?? activity.start_date ?? '',
  }
}

async function loadStravaData(): Promise<Extract<StravaDataResult, { status: 'ready' }>> {
  if (cachedResult && cachedResult.expiresAt > Date.now()) return cachedResult.result

  const { accessToken } = getStravaConfig()

  if (!accessToken) {
    throw new Error('Missing STRAVA_OAUTH_ACCESS_TOKEN')
  }

  const athlete = await getStravaApi<StravaAthleteResponse>('/athlete', accessToken)
  const [activities, stats] = await Promise.all([
    getStravaApi<StravaActivityResponse[]>('/athlete/activities?per_page=8', accessToken),
    getStravaApi<StravaStatsResponse>(`/athletes/${athlete.id}/stats`, accessToken),
  ])
  const location = [athlete.city, athlete.country].filter(Boolean).join(', ')
  const data: StravaData = {
    athlete: {
      avatarUrl: athlete.profile ?? null,
      id: athlete.id,
      location,
      name: [athlete.firstname, athlete.lastname].filter(Boolean).join(' ') || athlete.username || 'Strava Athlete',
      profileUrl: `https://www.strava.com/athletes/${athlete.id}`,
    },
    fetchedAt: new Date().toISOString(),
    recentActivities: activities.map(toActivity),
    totals: {
      allRide: toTotals(stats.all_ride_totals),
      allRun: toTotals(stats.all_run_totals),
      recentRide: toTotals(stats.recent_ride_totals),
      recentRun: toTotals(stats.recent_run_totals),
      yearRide: toTotals(stats.ytd_ride_totals),
      yearRun: toTotals(stats.ytd_run_totals),
    },
  }
  const result: Extract<StravaDataResult, { status: 'ready' }> = {
    cacheMaxAgeSeconds: STRAVA_CACHE_MS / 1000,
    data,
    status: 'ready',
    tokenStorage: 'env',
  }

  cachedResult = {
    expiresAt: Date.now() + STRAVA_CACHE_MS,
    result,
  }

  return result
}

export const getStravaData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<StravaDataResult> => {
    const { missing } = getStravaConfig()

    if (missing.length > 0) {
      return {
        missing,
        status: 'missing_config',
      }
    }

    return loadStravaData()
  },
)
