export type DesktopSearch = {
  minimized: boolean
  maximized: boolean
  x: number
  y: number
}

export type AppId = 'home' | 'github'

export type RouteApp = AppId | 'none'

export type WindowState = DesktopSearch & {
  app: AppId
  z: number
}
