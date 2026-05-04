export type DesktopSearch = {
  minimized: boolean
  maximized: boolean
  x: number
  y: number
}

export type NotesDocumentId = 'home' | 'cv'

export type AppId = 'github' | 'notes' | 'skills' | 'strava'

export type RouteApp =
  | {
      app: AppId
      document?: NotesDocumentId
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
