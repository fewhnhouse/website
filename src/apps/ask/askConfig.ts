import type { AppId } from '@/desktop/types'

// App IDs the assistant is allowed to open via the open_app tool.
// Kept narrow on purpose — never forward an arbitrary string to the desktop.
export const OPENABLE_APP_IDS = [
  'browser',
  'contact',
  'game',
  'github',
  'issues',
  'notes',
  'settings',
  'strava',
  'terminal',
] as const satisfies readonly AppId[]

export type OpenableAppId = (typeof OPENABLE_APP_IDS)[number]

export function isOpenableAppId(value: unknown): value is OpenableAppId {
  return typeof value === 'string' && (OPENABLE_APP_IDS as readonly string[]).includes(value)
}

// Cost-control limits. Shared between client (pre-validation) and server.
export const ASK_LIMITS = {
  /** Max characters for a single user message before we reject it. */
  maxMessageChars: 1500,
  /** How many recent messages to forward to the model. */
  maxHistoryMessages: 8,
  /** Hard cap on output tokens per model call. */
  maxOutputTokens: 768,
  /** Max agentic steps (tool-call loops). */
  maxSteps: 3,
  /** Max raw request body size in bytes. */
  maxRequestBytes: 32 * 1024,
} as const

export const ASK_STARTERS = [
  'What does Felix do?',
  'Open his CV',
  'What is Felix building at Pricenow?',
  'What does he do for fun?',
] as const
