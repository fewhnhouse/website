export type DesktopSearch = {
  minimized: boolean
  maximized: boolean
  x: number
  y: number
  url?: string
}

export type NotesDocumentId = 'home' | 'cv'

export type AppId =
  | 'browser'
  | 'game'
  | 'github'
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
