import { createServerFn } from '@tanstack/react-start'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_URL = 'https://www.strava.com/api/v3'
const STRAVA_CACHE_MS = 20 * 60 * 1000

type StravaTokenResponse = {
  access_token: string
  expires_at: number
  expires_in: number
  refresh_token: string
  token_type: string
}

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
      tokenStorage: 'env' | 'memory'
    }
  | {
      status: 'needs_auth'
      authorizeUrl: string
      message: string
    }
  | {
      status: 'missing_config'
      missing: string[]
    }

let latestToken: StravaTokenResponse | null = null
let cachedResult: { expiresAt: number; result: Extract<StravaDataResult, { status: 'ready' }> } | null =
  null

function getStravaConfig() {
  const clientId = process.env.STRAVA_OAUTH_CLIENT_ID
  const clientSecret = process.env.STRAVA_OAUTH_CLIENT_SECRET
  const refreshToken = latestToken?.refresh_token ?? process.env.STRAVA_OAUTH_REFRESH_TOKEN
  const missing = [
    clientId ? null : 'STRAVA_OAUTH_CLIENT_ID',
    clientSecret ? null : 'STRAVA_OAUTH_CLIENT_SECRET',
  ].filter((value): value is string => Boolean(value))

  return {
    clientId,
    clientSecret,
    missing,
    refreshToken,
  }
}

function getCallbackUrl(origin?: string) {
  if (process.env.STRAVA_OAUTH_REDIRECT_URI) return process.env.STRAVA_OAUTH_REDIRECT_URI

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/strava/callback`

  return `${origin ?? 'http://localhost:3000'}/api/strava/callback`
}

function getAuthorizeUrl() {
  const { clientId } = getStravaConfig()
  const url = new URL(STRAVA_AUTH_URL)

  if (clientId) {
    url.searchParams.set('client_id', clientId)
  }

  url.searchParams.set('redirect_uri', getCallbackUrl())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('approval_prompt', 'auto')
  url.searchParams.set('scope', 'read,activity:read')

  return url.toString()
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return response.json() as Promise<T>

  const details = await response.text().catch(() => '')
  throw new Error(details ? `${fallbackMessage}: ${details}` : fallbackMessage)
}

async function refreshAccessToken(): Promise<{ storage: 'env' | 'memory'; token: StravaTokenResponse }> {
  const { clientId, clientSecret, missing, refreshToken } = getStravaConfig()

  if (missing.length > 0 || !clientId || !clientSecret) {
    throw new Error(`Missing Strava configuration: ${missing.join(', ')}`)
  }

  if (!refreshToken) {
    throw new Error('Missing STRAVA_OAUTH_REFRESH_TOKEN')
  }

  if (latestToken && latestToken.expires_at * 1000 > Date.now() + 60_000) {
    return { storage: 'memory', token: latestToken }
  }

  const response = await fetch(STRAVA_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const token = await parseJsonResponse<StravaTokenResponse>(response, 'Unable to refresh Strava token')
  latestToken = token

  return {
    storage: refreshToken === process.env.STRAVA_OAUTH_REFRESH_TOKEN ? 'env' : 'memory',
    token,
  }
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

  const { storage, token } = await refreshAccessToken()
  const athlete = await getStravaApi<StravaAthleteResponse>('/athlete', token.access_token)
  const [activities, stats] = await Promise.all([
    getStravaApi<StravaActivityResponse[]>('/athlete/activities?per_page=8', token.access_token),
    getStravaApi<StravaStatsResponse>(`/athletes/${athlete.id}/stats`, token.access_token),
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
    tokenStorage: storage,
  }

  cachedResult = {
    expiresAt: Date.now() + STRAVA_CACHE_MS,
    result,
  }

  return result
}

export const getStravaData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<StravaDataResult> => {
    const { missing, refreshToken } = getStravaConfig()

    if (missing.length > 0) {
      return {
        missing,
        status: 'missing_config',
      }
    }

    if (!refreshToken) {
      return {
        authorizeUrl: getAuthorizeUrl(),
        message:
          'Authorize this Strava app once as Felix, then store the returned refresh token as STRAVA_OAUTH_REFRESH_TOKEN.',
        status: 'needs_auth',
      }
    }

    return loadStravaData()
  },
)

export async function exchangeStravaAuthorizationCode(code: string, origin: string) {
  const { clientId, clientSecret, missing } = getStravaConfig()

  if (missing.length > 0 || !clientId || !clientSecret) {
    throw new Error(`Missing Strava configuration: ${missing.join(', ')}`)
  }

  const response = await fetch(STRAVA_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: getCallbackUrl(origin),
    }),
  })
  const token = await parseJsonResponse<StravaTokenResponse>(response, 'Unable to exchange Strava authorization code')
  latestToken = token
  cachedResult = null

  return {
    expiresAt: token.expires_at,
    refreshToken: token.refresh_token,
  }
}
