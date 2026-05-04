import { createFileRoute } from '@tanstack/react-router'

import { exchangeStravaAuthorizationCode } from '../apps/strava/stravaData'

export const Route = createFileRoute('/api/strava/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error) {
          return htmlResponse(`<h1>Strava authorization failed</h1><p>${escapeHtml(error)}</p>`, 400)
        }

        if (!code) {
          return htmlResponse('<h1>Missing Strava authorization code</h1>', 400)
        }

        try {
          const token = await exchangeStravaAuthorizationCode(code, url.origin)

          return htmlResponse(`
            <h1>Strava connected</h1>
            <p>Store this value as <code>STRAVA_OAUTH_REFRESH_TOKEN</code> in your backend environment.</p>
            <pre>${escapeHtml(token.refreshToken)}</pre>
            <p>The access token expires at Unix timestamp <code>${token.expiresAt}</code>.</p>
          `)
        } catch (exchangeError) {
          const message = exchangeError instanceof Error ? exchangeError.message : 'Unknown Strava error'

          return htmlResponse(`<h1>Strava token exchange failed</h1><p>${escapeHtml(message)}</p>`, 500)
        }
      },
    },
  },
})

function htmlResponse(body: string, status = 200) {
  return new Response(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Strava OAuth</title>
        <style>
          body {
            margin: 0;
            min-height: 100svh;
            display: grid;
            place-items: center;
            background: #0f0f0f;
            color: #f7f7f4;
            font: 16px/1.5 ui-sans-serif, system-ui, sans-serif;
          }
          main {
            width: min(720px, calc(100% - 2rem));
            border: 1px solid rgba(252, 76, 2, 0.48);
            border-radius: 12px;
            background: #181818;
            padding: 2rem;
            box-shadow: 0 26px 80px rgba(0, 0, 0, 0.34);
          }
          h1 { margin: 0 0 0.75rem; color: #fc4c02; }
          code, pre {
            border-radius: 8px;
            background: #0b0b0b;
            color: #fff;
          }
          code { padding: 0.1rem 0.35rem; }
          pre {
            overflow: auto;
            padding: 1rem;
            user-select: all;
          }
        </style>
      </head>
      <body><main>${body}</main></body>
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
