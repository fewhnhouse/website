import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { defaultWindow } from './routeState'
import type { AppId, DesktopSearch, RouteApp, WindowState } from './types'

let rememberedWindows: WindowState[] | null = null
let rememberedFocusedApp: AppId | null = null

export function useDesktopWindows(routeApp: RouteApp) {
  const search = useSearch({ strict: false }) as DesktopSearch
  const navigate = useNavigate()
  const [windows, setWindows] = useState<WindowState[]>(() =>
    rememberedWindows ??
    (routeApp === 'none'
      ? []
      : [
          {
            ...search,
            app: routeApp,
            z: 1,
          },
        ]),
  )
  const [focusedApp, setFocusedApp] = useState<AppId | null>(
    rememberedFocusedApp ?? (routeApp === 'none' ? null : routeApp),
  )
  const [windowExit, setWindowExit] = useState<'close' | 'minimize'>('close')
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const draggingApp = useRef<AppId | null>(null)
  const zCounter = useRef(2)

  useEffect(() => {
    rememberedWindows = windows
  }, [windows])

  useEffect(() => {
    rememberedFocusedApp = focusedApp
  }, [focusedApp])

  useEffect(() => {
    if (routeApp === 'none') return

    setWindows((current) => {
      const existing = current.find((window) => window.app === routeApp)
      const nextZ = zCounter.current++

      if (existing) {
        return current.map((window) =>
          window.app === routeApp
            ? {
                ...window,
                ...search,
                app: routeApp,
                z: nextZ,
              }
            : window,
        )
      }

      return [
        ...current,
        {
          ...search,
          app: routeApp,
          z: nextZ,
        },
      ]
    })
    setFocusedApp(routeApp)
  }, [routeApp, search.maximized, search.minimized, search.x, search.y])

  const routeForApp = (app: AppId | null) => (app ? `/${app}` : '/')

  const persistFocusedWindow = (window: WindowState | undefined) => {
    void navigate({
      to: routeForApp(window?.app ?? null),
      search: window
        ? {
            maximized: window.maximized,
            minimized: window.minimized,
            x: Math.round(window.x),
            y: Math.round(window.y),
          }
        : {},
    })
  }

  const focusWindow = (app: AppId) => {
    const existing = windows.find((window) => window.app === app)

    if (!existing) return

    const nextZ = zCounter.current++
    const focused: WindowState = {
      ...existing,
      minimized: false,
      z: nextZ,
    }

    setWindows((current) => current.map((window) => (window.app === app ? focused : window)))
    setFocusedApp(app)
    persistFocusedWindow(focused)
  }

  const openApp = (app: AppId) => {
    const existing = windows.find((window) => window.app === app)
    const nextZ = zCounter.current++
    const focused: WindowState = existing
      ? {
          ...existing,
          minimized: false,
          z: nextZ,
        }
      : {
          ...defaultWindow,
          app,
          x: app === 'github' ? 362 : defaultWindow.x,
          y: app === 'github' ? 110 : defaultWindow.y,
          z: nextZ,
        }

    setWindows((current) =>
      existing
        ? current.map((window) => (window.app === app ? focused : window))
        : [...current, focused],
    )
    setFocusedApp(app)
    persistFocusedWindow(focused)
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>, window: WindowState) => {
    focusWindow(window.app)

    if (event.button !== 0 || window.maximized) return

    dragging.current = true
    draggingApp.current = window.app
    dragOffset.current = {
      x: event.clientX - window.x,
      y: event.clientY - window.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveWindow = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !draggingApp.current) return

    const nextX = Math.max(12, Math.min(event.clientX - dragOffset.current.x, window.innerWidth - 360))
    const nextY = Math.max(54, Math.min(event.clientY - dragOffset.current.y, window.innerHeight - 180))
    const app = draggingApp.current

    setWindows((current) =>
      current.map((window) =>
        window.app === app
          ? {
              ...window,
              x: nextX,
              y: nextY,
            }
          : window,
      ),
    )
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !draggingApp.current) return

    const app = draggingApp.current
    dragging.current = false
    draggingApp.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    setWindows((current) => {
      const movedWindow = current.find((window) => window.app === app)

      if (movedWindow && focusedApp === app) {
        persistFocusedWindow(movedWindow)
      }

      return current
    })
  }

  const closeWindow = (app: AppId) => {
    setWindowExit('close')
    const remaining = windows.filter((window) => window.app !== app)
    const nextFocused =
      focusedApp === app
        ? [...remaining].sort((a, b) => b.z - a.z).find((window) => !window.minimized) ??
          remaining.at(-1)
        : windows.find((window) => window.app === focusedApp)

    setWindows(remaining)
    setFocusedApp(nextFocused?.app ?? null)
    persistFocusedWindow(nextFocused)
  }

  const minimizeWindow = (app: AppId) => {
    setWindowExit('minimize')
    const minimizedWindow = windows.find((window) => window.app === app)

    if (!minimizedWindow) return

    const nextWindow = {
      ...minimizedWindow,
      minimized: true,
    }

    setWindows((current) => current.map((window) => (window.app === app ? nextWindow : window)))

    if (focusedApp === app) {
      persistFocusedWindow(nextWindow)
    }
  }

  const toggleMaximizeWindow = (app: AppId) => {
    const existing = windows.find((window) => window.app === app)

    if (!existing) return

    const nextZ = zCounter.current++
    const changedWindow: WindowState = {
      ...existing,
      maximized: !existing.maximized,
      minimized: false,
      z: nextZ,
    }

    setWindows((current) =>
      current.map((window) => (window.app === app ? changedWindow : window)),
    )
    setFocusedApp(app)
    persistFocusedWindow(changedWindow)
  }

  return {
    closeWindow,
    focusedApp,
    focusWindow,
    minimizeWindow,
    moveWindow,
    openApp,
    startDrag,
    stopDrag,
    toggleMaximizeWindow,
    windowExit,
    windows,
  }
}
