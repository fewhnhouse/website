export type DesktopSearch = {
  minimized: boolean
  maximized: boolean
  x: number
  y: number
  // Pixel size of a snap-tiled window. Absent when the window uses its
  // default app-driven size (the common case).
  w?: number
  h?: number
  url?: string
}

export type NotesDocumentId = 'home' | 'cv'

export type AppId =
  | 'ask'
  | 'browser'
  | 'contact'
  | 'game'
  | 'github'
  | 'guestbook'
  | 'help'
  | 'issues'
  | 'notes'
  | 'settings'
  | 'strava'
  | 'terminal'

export type RouteApp =
  | {
      app: AppId
      document?: NotesDocumentId
      url?: string
    }
  | 'none'

export type WindowState = DesktopSearch & {
  app: AppId
  document?: NotesDocumentId
  z: number
}

export function windowKey(window: Pick<WindowState, 'app' | 'document'>) {
  return window.app === 'notes' ? `notes:${window.document ?? 'home'}` : window.app
}
