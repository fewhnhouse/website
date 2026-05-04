import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { defaultWindow } from './routeState'
import type { AppId, DesktopSearch, RouteApp, WindowState } from './types'

let rememberedWindows: WindowState[] | null = null
let rememberedFocusedApp: AppId | null = null

type DesktopWindowMemory = {
  focusedApp: AppId | null
  windows: WindowState[] | null
}

declare global {
  interface Window {
    __felixDesktopWindowMemory?: DesktopWindowMemory
  }
}

const getDesktopWindowMemory = () => {
  if (typeof window === 'undefined') return null

  window.__felixDesktopWindowMemory ??= {
    focusedApp: null,
    windows: null,
  }

  return window.__felixDesktopWindowMemory
}

const getRememberedWindows = () => getDesktopWindowMemory()?.windows ?? rememberedWindows
const getRememberedFocusedApp = () =>
  getDesktopWindowMemory()?.focusedApp ?? rememberedFocusedApp

export function useDesktopWindows(routeApp: RouteApp) {
  const search = useSearch({ strict: false }) as DesktopSearch
  const navigate = useNavigate()
  const [windows, setWindows] = useState<WindowState[]>(() =>
    getRememberedWindows() ??
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
    getRememberedFocusedApp() ?? (routeApp === 'none' || search.minimized ? null : routeApp),
  )
  const [windowExit, setWindowExit] = useState<'close' | 'minimize'>('close')
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const draggingApp = useRef<AppId | null>(null)
  const windowsRef = useRef(windows)
  const focusedAppRef = useRef(focusedApp)
  const zCounter = useRef(
    Math.max(1, ...(getRememberedWindows() ?? []).map((window) => window.z)) + 1,
  )

  useEffect(() => {
    windowsRef.current = windows
    rememberedWindows = windows
    const memory = getDesktopWindowMemory()
    if (memory) memory.windows = windows
  }, [windows])

  useEffect(() => {
    focusedAppRef.current = focusedApp
    rememberedFocusedApp = focusedApp
    const memory = getDesktopWindowMemory()
    if (memory) memory.focusedApp = focusedApp
  }, [focusedApp])

  const commitWindows = (nextWindows: WindowState[]) => {
    windowsRef.current = nextWindows
    rememberedWindows = nextWindows
    const memory = getDesktopWindowMemory()
    if (memory) memory.windows = nextWindows
    setWindows(nextWindows)
  }

  const commitFocusedApp = (nextApp: AppId | null) => {
    focusedAppRef.current = nextApp
    rememberedFocusedApp = nextApp
    const memory = getDesktopWindowMemory()
    if (memory) memory.focusedApp = nextApp
    setFocusedApp(nextApp)
  }

  useEffect(() => {
    if (routeApp === 'none') return

    const current = windowsRef.current
    const existing = current.find((window) => window.app === routeApp)
    const nextZ = zCounter.current++
    const routeWindow: WindowState = {
      ...search,
      app: routeApp,
      z: nextZ,
    }
    const nextWindows = existing
      ? current.map((window) =>
          window.app === routeApp
            ? {
                ...window,
                ...routeWindow,
              }
            : window,
        )
      : [...current, routeWindow]

    commitWindows(nextWindows)
    if (!search.minimized) {
      commitFocusedApp(routeApp)
    }
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

  const topmostVisibleWindow = (windows: WindowState[]) =>
    [...windows].sort((a, b) => b.z - a.z).find((window) => !window.minimized)

  const setFocusedWindow = (window: WindowState | undefined) => {
    commitFocusedApp(window?.app ?? null)
    persistFocusedWindow(window)
  }

  const focusWindow = (app: AppId) => {
    const current = windowsRef.current
    const existing = current.find((window) => window.app === app)

    if (!existing) return

    const nextZ = zCounter.current++
    const focused: WindowState = {
      ...existing,
      minimized: false,
      z: nextZ,
    }

    commitWindows(current.map((window) => (window.app === app ? focused : window)))
    setFocusedWindow(focused)
  }

  const openApp = (app: AppId) => {
    const current = windowsRef.current
    const existing = current.find((window) => window.app === app)
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
          x: app === 'github' ? 362 : app === 'strava' ? 214 : defaultWindow.x,
          y: app === 'github' ? 110 : app === 'strava' ? 126 : defaultWindow.y,
          z: nextZ,
        }

    commitWindows(
      existing
        ? current.map((window) => (window.app === app ? focused : window))
        : [...current, focused],
    )
    setFocusedWindow(focused)
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

    const current = windowsRef.current
    const nextWindows = current.map((window) =>
      window.app === app
        ? {
            ...window,
            x: nextX,
            y: nextY,
          }
        : window,
    )

    commitWindows(nextWindows)
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !draggingApp.current) return

    const app = draggingApp.current
    dragging.current = false
    draggingApp.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)

    const movedWindow = windowsRef.current.find((window) => window.app === app)

    if (movedWindow && focusedAppRef.current === app) {
      persistFocusedWindow(movedWindow)
    }
  }

  const closeWindow = (app: AppId) => {
    setWindowExit('close')
    const current = windowsRef.current
    const remaining = current.filter((window) => window.app !== app)
    const nextFocused =
      focusedAppRef.current === app
        ? topmostVisibleWindow(remaining) ?? remaining.at(-1)
        : current.find((window) => window.app === focusedAppRef.current)

    commitWindows(remaining)
    setFocusedWindow(nextFocused)
  }

  const minimizeWindow = (app: AppId) => {
    setWindowExit('minimize')
    const current = windowsRef.current
    const minimizedWindow = current.find((window) => window.app === app)

    if (!minimizedWindow) return

    const nextWindow = {
      ...minimizedWindow,
      minimized: true,
    }
    const nextWindows = current.map((window) => (window.app === app ? nextWindow : window))

    commitWindows(nextWindows)

    if (focusedAppRef.current === app) {
      setFocusedWindow(topmostVisibleWindow(nextWindows) ?? nextWindow)
    }
  }

  const toggleMaximizeWindow = (app: AppId) => {
    const current = windowsRef.current
    const existing = current.find((window) => window.app === app)

    if (!existing) return

    const nextZ = zCounter.current++
    const changedWindow: WindowState = {
      ...existing,
      maximized: !existing.maximized,
      minimized: false,
      z: nextZ,
    }

    commitWindows(current.map((window) => (window.app === app ? changedWindow : window)))
    setFocusedWindow(changedWindow)
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
