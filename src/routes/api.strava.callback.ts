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
          return htmlResponse('Strava authorization failed', error, 400)
        }

        if (!code) {
          return htmlResponse('Strava authorization failed', 'Missing authorization code.', 400)
        }

        try {
          const token = await exchangeStravaAuthorizationCode({
            code,
            origin: url.origin,
            state: url.searchParams.get('state'),
          })

          return htmlResponse(
            'Strava connected',
            `Stored a token with scopes: ${escapeHtml(token.scope ?? 'unknown')}. You can close this tab.`,
          )
        } catch (exchangeError) {
          const message = exchangeError instanceof Error ? exchangeError.message : 'Unknown Strava error'

          return htmlResponse('Strava authorization failed', message, 500)
        }
      },
    },
  },
})

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
            background: #111;
            color: #f7f7f4;
            font: 16px/1.5 ui-sans-serif, system-ui, sans-serif;
          }
          main {
            width: min(560px, calc(100% - 2rem));
            border: 1px solid rgba(252, 76, 2, 0.45);
            border-radius: 12px;
            background: #171717;
            padding: 1.5rem;
          }
          h1 {
            margin: 0 0 0.5rem;
            color: #fc4c02;
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
