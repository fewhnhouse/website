import { createServerFn } from '@tanstack/react-start'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_URL = 'https://www.strava.com/api/v3'
const STRAVA_CACHE_MS = 24 * 60 * 60 * 1000
const STRAVA_CACHE_CONTROL = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
const STRAVA_TOKEN_BLOB_PATH = 'private/strava/oauth-token.json'
const STRAVA_SCOPES = ['read', 'profile:read_all', 'activity:read_all'] as const

type StravaTokenResponse = {
  access_token: string
  athlete?: unknown
  expires_at: number
  expires_in: number
  refresh_token: string
  scope?: string
  token_type: string
}

type StravaStoredToken = StravaTokenResponse & {
  updated_at: string
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
      tokenStorage: 'blob' | 'env'
    }
  | {
      status: 'missing_config'
      missing: string[]
    }

let cachedResult: { expiresAt: number; result: Extract<StravaDataResult, { status: 'ready' }> } | null =
  null
let stravaDataPromise: Promise<Extract<StravaDataResult, { status: 'ready' }>> | null = null

function getStravaConfig() {
  const clientId = process.env.STRAVA_OAUTH_CLIENT_ID
  const clientSecret = process.env.STRAVA_OAUTH_CLIENT_SECRET
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const missing = [
    clientId ? null : 'STRAVA_OAUTH_CLIENT_ID',
    clientSecret ? null : 'STRAVA_OAUTH_CLIENT_SECRET',
    blobToken ? null : 'BLOB_READ_WRITE_TOKEN',
  ].filter((value): value is string => Boolean(value))

  return {
    blobToken,
    clientId,
    clientSecret,
    missing,
  }
}

function getCallbackUrl(origin: string) {
  if (process.env.STRAVA_OAUTH_REDIRECT_URI) return process.env.STRAVA_OAUTH_REDIRECT_URI

  return `${origin}/api/strava/callback`
}

function getStateValue() {
  return process.env.STRAVA_OAUTH_STATE ?? 'felix-strava-oauth'
}

export function getStravaAuthorizeUrl(origin: string) {
  const { clientId, missing } = getStravaConfig()

  if (missing.length > 0 || !clientId) {
    throw new Error(`Missing Strava configuration: ${missing.join(', ')}`)
  }

  const url = new URL(STRAVA_AUTH_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', getCallbackUrl(origin))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('approval_prompt', 'force')
  url.searchParams.set('scope', STRAVA_SCOPES.join(','))
  url.searchParams.set('state', getStateValue())

  return url.toString()
}

function getEnvToken(): StravaStoredToken | null {
  const accessToken = process.env.STRAVA_OAUTH_ACCESS_TOKEN
  const refreshToken = process.env.STRAVA_OAUTH_REFRESH_TOKEN

  if (!accessToken || !refreshToken) return null

  return {
    access_token: accessToken,
    expires_at: Number(process.env.STRAVA_OAUTH_EXPIRES_AT ?? 0),
    expires_in: 0,
    refresh_token: refreshToken,
    scope: process.env.STRAVA_OAUTH_SCOPE,
    token_type: 'Bearer',
    updated_at: new Date(0).toISOString(),
  }
}

async function readBlobText(stream: ReadableStream<Uint8Array>) {
  return new Response(stream).text()
}

async function getStoredStravaToken(): Promise<{ source: 'blob' | 'env'; token: StravaStoredToken } | null> {
  const { blobToken } = getStravaConfig()

  if (blobToken) {
    const { get } = await import('@vercel/blob')
    const blob = await get(STRAVA_TOKEN_BLOB_PATH, {
      access: 'private',
      token: blobToken,
      useCache: false,
    }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'BlobNotFoundError') return null

      throw error
    })

    if (blob?.statusCode === 200 && blob.stream) {
      return {
        source: 'blob',
        token: JSON.parse(await readBlobText(blob.stream)) as StravaStoredToken,
      }
    }
  }

  const envToken = getEnvToken()

  return envToken ? { source: 'env', token: envToken } : null
}

async function storeStravaToken(token: StravaTokenResponse) {
  const { blobToken } = getStravaConfig()

  if (!blobToken) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN')
  }

  const { put } = await import('@vercel/blob')
  const storedToken: StravaStoredToken = {
    ...token,
    updated_at: new Date().toISOString(),
  }

  await put(STRAVA_TOKEN_BLOB_PATH, JSON.stringify(storedToken, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    token: blobToken,
  })

  return storedToken
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return response.json() as Promise<T>

  const details = await response.text().catch(() => '')

  if (details.includes('"field":"activity:read_permission"')) {
    throw new Error(
      'The stored Strava access token is missing activity:read_all. Re-authorize the Strava app and update the token stored in Vercel Blob.',
    )
  }

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

  const storedToken = await getFreshStravaToken()

  const athlete = await getStravaApi<StravaAthleteResponse>('/athlete', storedToken.token.access_token)
  const [activities, stats] = await Promise.all([
    getStravaApi<StravaActivityResponse[]>('/athlete/activities?per_page=8', storedToken.token.access_token),
    getStravaApi<StravaStatsResponse>(`/athletes/${athlete.id}/stats`, storedToken.token.access_token),
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
    tokenStorage: storedToken.source,
  }

  cachedResult = {
    expiresAt: Date.now() + STRAVA_CACHE_MS,
    result,
  }

  return result
}

export const getStravaData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<StravaDataResult> => {
    const { setResponseHeader } = await import('@tanstack/react-start/server')
    const { missing } = getStravaConfig()

    setResponseHeader('Cache-Control', STRAVA_CACHE_CONTROL)

    if (missing.length > 0) {
      return {
        missing,
        status: 'missing_config',
      }
    }

    if (cachedResult && cachedResult.expiresAt > Date.now()) return cachedResult.result

    if (stravaDataPromise) return stravaDataPromise

    stravaDataPromise = loadStravaData().finally(() => {
      stravaDataPromise = null
    })

    return stravaDataPromise
  },
)

async function getFreshStravaToken(): Promise<{ source: 'blob' | 'env'; token: StravaStoredToken }> {
  const storedToken = await getStoredStravaToken()

  if (!storedToken) {
    throw new Error('No Strava OAuth token found in Vercel Blob.')
  }

  if (storedToken.token.expires_at * 1000 > Date.now() + 5 * 60 * 1000) {
    return storedToken
  }

  const { clientId, clientSecret } = getStravaConfig()

  if (!clientId || !clientSecret) {
    throw new Error('Missing Strava client credentials')
  }

  const token = await postStravaToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: storedToken.token.refresh_token,
  })

  return {
    source: 'blob',
    token: await storeStravaToken(token),
  }
}

async function postStravaToken(params: Record<string, string>) {
  const response = await fetch(STRAVA_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  })

  return parseJsonResponse<StravaTokenResponse>(response, 'Unable to exchange Strava OAuth token')
}

export async function exchangeStravaAuthorizationCode({
  code,
  origin,
  state,
}: {
  code: string
  origin: string
  state: string | null
}) {
  const { clientId, clientSecret, missing } = getStravaConfig()

  if (missing.length > 0 || !clientId || !clientSecret) {
    throw new Error(`Missing Strava configuration: ${missing.join(', ')}`)
  }

  if (state !== getStateValue()) {
    throw new Error('Invalid Strava OAuth state')
  }

  const token = await postStravaToken({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: getCallbackUrl(origin),
  })

  if (!STRAVA_SCOPES.every((scope) => token.scope?.split(/[,\s]+/).includes(scope))) {
    throw new Error(`Strava authorization did not grant required scopes: ${STRAVA_SCOPES.join(', ')}`)
  }

  cachedResult = null

  return storeStravaToken(token)
}
