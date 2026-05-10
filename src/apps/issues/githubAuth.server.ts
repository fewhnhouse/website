import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import type { GithubIssueUser } from './types'

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const USER_URL = 'https://api.github.com/user'
const OAUTH_SCOPE = 'public_repo'
const SESSION_COOKIE = 'felix_github_issue_session'
const STATE_COOKIE = 'felix_github_oauth_state'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14
const STATE_MAX_AGE_SECONDS = 60 * 10

export type GithubIssueSession = {
  accessToken: string
  createdAt: string
  user: GithubIssueUser
}

type GithubTokenResponse =
  | {
      access_token: string
      scope?: string
      token_type?: string
    }
  | {
      error: string
      error_description?: string
    }

type GithubUserResponse = {
  avatar_url?: string
  html_url?: string
  login?: string
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function getGithubOAuthConfig(origin: string) {
  return {
    callbackUrl: process.env.GITHUB_OAUTH_CALLBACK_URL || `${origin}/api/github/callback`,
    clientId: getRequiredEnv('GITHUB_OAUTH_CLIENT_ID'),
    clientSecret: getRequiredEnv('GITHUB_OAUTH_CLIENT_SECRET'),
    sessionSecret: getRequiredEnv('SESSION_SECRET'),
  }
}

function isSecureOrigin(origin: string) {
  return new URL(origin).protocol === 'https:'
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean
    maxAge?: number
    origin: string
  },
) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'SameSite=Lax',
    options.httpOnly ? 'HttpOnly' : null,
    isSecureOrigin(options.origin) ? 'Secure' : null,
    typeof options.maxAge === 'number' ? `Max-Age=${options.maxAge}` : null,
  ].filter(Boolean)

  return parts.join('; ')
}

function redirectResponse(location: string, headers?: HeadersInit) {
  return new Response(null, {
    headers: {
      ...headers,
      Location: location,
    },
    status: 302,
  })
}

function parseCookieHeader(cookieHeader: string | null) {
  const cookies = new Map<string, string>()

  cookieHeader?.split(';').forEach((cookie) => {
    const separatorIndex = cookie.indexOf('=')

    if (separatorIndex < 0) return

    cookies.set(cookie.slice(0, separatorIndex).trim(), cookie.slice(separatorIndex + 1).trim())
  })

  return cookies
}

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url')
}

function sessionKey(secret: string) {
  return createHash('sha256').update(secret).digest()
}

function encryptSession(session: GithubIssueSession, secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', sessionKey(secret), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return ['v1', base64UrlEncode(iv), base64UrlEncode(tag), base64UrlEncode(encrypted)].join('.')
}

function decryptSession(value: string, secret: string): GithubIssueSession | null {
  const [version, ivValue, tagValue, encryptedValue] = value.split('.')

  if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) return null

  try {
    const decipher = createDecipheriv('aes-256-gcm', sessionKey(secret), base64UrlDecode(ivValue))
    decipher.setAuthTag(base64UrlDecode(tagValue))
    const decrypted = Buffer.concat([
      decipher.update(base64UrlDecode(encryptedValue)),
      decipher.final(),
    ])

    return JSON.parse(decrypted.toString('utf8')) as GithubIssueSession
  } catch {
    return null
  }
}

export function createGithubLoginResponse(request: Request) {
  const requestUrl = new URL(request.url)
  const config = getGithubOAuthConfig(requestUrl.origin)
  const state = randomBytes(32).toString('base64url')
  const authorizeUrl = new URL(AUTHORIZE_URL)

  authorizeUrl.searchParams.set('client_id', config.clientId)
  authorizeUrl.searchParams.set('redirect_uri', config.callbackUrl)
  authorizeUrl.searchParams.set('scope', OAUTH_SCOPE)
  authorizeUrl.searchParams.set('state', state)

  const response = redirectResponse(authorizeUrl.toString())
  response.headers.append(
    'Set-Cookie',
    serializeCookie(STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: STATE_MAX_AGE_SECONDS,
      origin: requestUrl.origin,
    }),
  )

  return response
}

export async function createGithubCallbackResponse(request: Request) {
  const requestUrl = new URL(request.url)
  const config = getGithubOAuthConfig(requestUrl.origin)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const state = requestUrl.searchParams.get('state')
  const cookies = parseCookieHeader(request.headers.get('cookie'))
  const expectedState = cookies.get(STATE_COOKIE)

  if (error) {
    return htmlResponse('GitHub sign-in failed', error, 400)
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return htmlResponse('GitHub sign-in failed', 'The OAuth state did not match. Please try again.', 400)
  }

  const tokenResponse = await fetch(TOKEN_URL, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.callbackUrl,
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })
  const tokenData = (await tokenResponse.json()) as GithubTokenResponse

  if ('error' in tokenData) {
    return htmlResponse(
      'GitHub sign-in failed',
      tokenData.error_description ?? tokenData.error,
      400,
    )
  }

  const userResponse = await fetch(USER_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'felix-website-issues',
    },
  })
  const userData = (await userResponse.json()) as GithubUserResponse

  if (!userResponse.ok || !userData.login) {
    return htmlResponse('GitHub sign-in failed', 'Could not load your GitHub profile.', 400)
  }

  const session: GithubIssueSession = {
    accessToken: tokenData.access_token,
    createdAt: new Date().toISOString(),
    user: {
      avatarUrl: userData.avatar_url ?? '',
      login: userData.login,
      url: userData.html_url ?? `https://github.com/${userData.login}`,
    },
  }
  const response = redirectResponse(`${requestUrl.origin}/issues`)

  response.headers.append(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, encryptSession(session, config.sessionSecret), {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE_SECONDS,
      origin: requestUrl.origin,
    }),
  )
  response.headers.append(
    'Set-Cookie',
    serializeCookie(STATE_COOKIE, '', {
      httpOnly: true,
      maxAge: 0,
      origin: requestUrl.origin,
    }),
  )

  return response
}

export function createGithubLogoutResponse(request: Request) {
  const requestUrl = new URL(request.url)
  const response = redirectResponse(`${requestUrl.origin}/issues`)

  response.headers.append(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, '', {
      httpOnly: true,
      maxAge: 0,
      origin: requestUrl.origin,
    }),
  )

  return response
}

export function getGithubIssueSessionFromCookie(cookieHeader: string | null, origin: string) {
  const secret = getGithubOAuthConfig(origin).sessionSecret
  const sessionCookie = parseCookieHeader(cookieHeader).get(SESSION_COOKIE)

  if (!sessionCookie) return null

  return decryptSession(sessionCookie, secret)
}

function htmlResponse(title: string, message: string, status = 200) {
  return new Response(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            display: grid;
            min-height: 100svh;
            margin: 0;
            place-items: center;
            background: #111827;
            color: #f8fafc;
            font: 16px/1.5 ui-sans-serif, system-ui, sans-serif;
          }
          main {
            width: min(560px, calc(100% - 2rem));
            border: 1px solid rgba(111, 124, 255, 0.45);
            border-radius: 12px;
            background: #172033;
            padding: 1.5rem;
          }
          h1 {
            margin: 0 0 0.5rem;
            color: #a5b4fc;
          }
          p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(message)}</p>
        </main>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      status,
    },
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
