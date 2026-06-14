import { createFileRoute } from '@tanstack/react-router'
import type { UIMessage } from 'ai'

import { ASK_LIMITS } from '@/apps/ask/askConfig'
import { hasApiKey, isAskEnabled, streamAskResponse } from '@/apps/ask/askChat.server'
import { checkRateLimit, clientIpFromHeaders } from '@/apps/ask/rateLimit.server'

function jsonError(message: string, status: number, extraHeaders?: HeadersInit) {
  return Response.json({ error: message }, { status, headers: extraHeaders })
}

function userMessageText(message: UIMessage): string {
  if (message.role !== 'user' || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export const Route = createFileRoute('/api/ask')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAskEnabled()) {
          return jsonError(
            'The assistant is currently turned off. Explore the desktop apps instead!',
            503,
          )
        }

        if (!hasApiKey()) {
          return jsonError(
            "The assistant isn't configured yet. Try the desktop apps, or reach Felix via the Contact app.",
            503,
          )
        }

        // Cap raw payload size before parsing.
        const contentLength = Number(request.headers.get('content-length') ?? 0)
        if (contentLength > ASK_LIMITS.maxRequestBytes) {
          return jsonError('That request is too large.', 413)
        }

        // Per-IP + global daily rate limiting.
        const ip = clientIpFromHeaders(request.headers)
        const limit = checkRateLimit(ip)
        if (!limit.ok) {
          const message =
            limit.reason === 'global'
              ? 'The assistant has hit its daily limit. Please try again tomorrow.'
              : "You're sending messages too quickly. Please slow down a moment."
          return jsonError(message, 429, {
            'Retry-After': String(limit.retryAfterSeconds),
          })
        }

        let body: unknown
        try {
          const raw = await request.text()
          if (raw.length > ASK_LIMITS.maxRequestBytes) {
            return jsonError('That request is too large.', 413)
          }
          body = JSON.parse(raw)
        } catch {
          return jsonError('Invalid request body.', 400)
        }

        const messages = (body as { messages?: unknown })?.messages
        if (!Array.isArray(messages) || messages.length === 0) {
          return jsonError('No messages provided.', 400)
        }

        // Reject any single over-length user message before calling the model.
        const tooLong = (messages as UIMessage[]).some(
          (message) => userMessageText(message).length > ASK_LIMITS.maxMessageChars,
        )
        if (tooLong) {
          return jsonError(
            `Please keep messages under ${ASK_LIMITS.maxMessageChars} characters.`,
            400,
          )
        }

        try {
          return await streamAskResponse(messages as UIMessage[])
        } catch (error) {
          console.error('Ask Felix failed', error)
          return jsonError('The assistant ran into a problem. Please try again.', 500)
        }
      },
    },
  },
})
