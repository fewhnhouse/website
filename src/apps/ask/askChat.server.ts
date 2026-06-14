import {
  convertToModelMessages,
  gateway,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai'
import { z } from 'zod'

import cvMarkdown from '@/apps/notes/cv.mdx?raw'
import homeMarkdown from '@/apps/notes/home.mdx?raw'

import { ASK_LIMITS, isOpenableAppId, OPENABLE_APP_IDS } from './askConfig'

// Routed through the Vercel AI Gateway (slug format: "creator/model").
const MODEL_ID = 'anthropic/claude-haiku-4.5'

export function isAskEnabled(): boolean {
  return process.env.ASK_FELIX_ENABLED !== 'false'
}

export function isAskConfigured(): boolean {
  // The AI Gateway authenticates with AI_GATEWAY_API_KEY, or automatically
  // via OIDC when the app is deployed on Vercel.
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL)
}

function buildSystemPrompt(): string {
  return [
    "You are the assistant inside FelixOS, Felix Wohnhaas's portfolio website.",
    'Answer visitors\' questions about Felix: his background, work, projects, skills, and interests.',
    'Be friendly, factual, and brief — a sentence or two is usually plenty. Use plain text, no markdown headings.',
    'Ground every answer ONLY in the context below. If something is not covered, say you do not know rather than inventing facts.',
    'You can open other FelixOS apps for the visitor with the open_app tool when it is clearly helpful',
    `(for example "open his CV" → open_app with appId "notes"). Valid appIds: ${OPENABLE_APP_IDS.join(', ')}.`,
    'For the CV use appId "notes". Only open an app when the visitor asks to see or go to something.',
    '',
    '=== Felix intro (home.mdx) ===',
    homeMarkdown,
    '',
    '=== Felix resume (cv.mdx) ===',
    cvMarkdown,
  ].join('\n')
}

const openAppTool = tool({
  description:
    'Open a FelixOS desktop app/window for the visitor. Use the CV (appId "notes") when they ask about his resume.',
  inputSchema: z.object({
    appId: z
      .enum(OPENABLE_APP_IDS)
      .describe('Which FelixOS app to open.'),
  }),
  execute: async ({ appId }) => {
    // Defence in depth — the enum already constrains this, but never forward
    // an unvalidated value onward to the desktop.
    if (!isOpenableAppId(appId)) {
      return { opened: false, appId, error: 'Unknown app' }
    }
    return { opened: true, appId }
  },
})

/**
 * Runs the assistant against the provided UI messages and returns a streaming
 * UI-message response. Assumes the feature is enabled, the key is present, and
 * the messages have already been validated/capped by the caller.
 */
export async function streamAskResponse(messages: UIMessage[]): Promise<Response> {
  // Only forward the most recent N messages to bound token spend.
  const recent = messages.slice(-ASK_LIMITS.maxHistoryMessages)

  const result = streamText({
    model: gateway(MODEL_ID),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(recent),
    maxOutputTokens: ASK_LIMITS.maxOutputTokens,
    stopWhen: stepCountIs(ASK_LIMITS.maxSteps),
    tools: { open_app: openAppTool },
  })

  return result.toUIMessageStreamResponse()
}
