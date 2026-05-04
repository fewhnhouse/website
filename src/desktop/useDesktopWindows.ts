import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { defaultWindow } from './routeState'
import { windowKey, type AppId, type DesktopSearch, type NotesDocumentId, type RouteApp, type WindowState } from './types'

let rememberedWindows: WindowState[] | null = null
let rememberedFocusedWindow: string | null = null

type DesktopWindowMemory = {
  focusedWindow: string | null
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
    focusedWindow: null,
    windows: null,
  }

  return window.__felixDesktopWindowMemory
}

const getRememberedWindows = () => getDesktopWindowMemory()?.windows ?? rememberedWindows
const getRememberedFocusedWindow = () =>
  getDesktopWindowMemory()?.focusedWindow ?? rememberedFocusedWindow

export function useDesktopWindows(routeApp: RouteApp) {
  const search = useSearch({ strict: false }) as DesktopSearch
  const navigate = useNavigate()
  const routeAppId = routeApp === 'none' ? null : routeApp.app
  const routeDocument = routeApp === 'none' ? undefined : routeApp.document
  const routeWindowKey =
    routeApp === 'none' ? null : windowKey({ app: routeApp.app, document: routeApp.document })
  const [windows, setWindows] = useState<WindowState[]>(() =>
    getRememberedWindows() ??
    (routeApp === 'none'
      ? []
      : [
          {
            ...search,
            app: routeApp.app,
            document: routeApp.document,
            z: 1,
          },
        ]),
  )
  const [focusedWindow, setFocusedWindowState] = useState<string | null>(
    getRememberedFocusedWindow() ?? (search.minimized ? null : routeWindowKey),
  )
  const [windowExit, setWindowExit] = useState<'close' | 'minimize'>('close')
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const draggingWindow = useRef<string | null>(null)
  const windowsRef = useRef(windows)
  const focusedWindowRef = useRef(focusedWindow)
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
    focusedWindowRef.current = focusedWindow
    rememberedFocusedWindow = focusedWindow
    const memory = getDesktopWindowMemory()
    if (memory) memory.focusedWindow = focusedWindow
  }, [focusedWindow])

  const commitWindows = (nextWindows: WindowState[]) => {
    windowsRef.current = nextWindows
    rememberedWindows = nextWindows
    const memory = getDesktopWindowMemory()
    if (memory) memory.windows = nextWindows
    setWindows(nextWindows)
  }

  const commitFocusedWindow = (nextWindow: string | null) => {
    focusedWindowRef.current = nextWindow
    rememberedFocusedWindow = nextWindow
    const memory = getDesktopWindowMemory()
    if (memory) memory.focusedWindow = nextWindow
    setFocusedWindowState(nextWindow)
  }

  useEffect(() => {
    if (!routeAppId || !routeWindowKey) return

    const current = windowsRef.current
    const existing = current.find((window) => windowKey(window) === routeWindowKey)
    const nextZ = zCounter.current++
    const routeWindow: WindowState = {
      ...search,
      app: routeAppId,
      document: routeDocument,
      z: nextZ,
    }
    const nextWindows = existing
      ? current.map((window) =>
          windowKey(window) === routeWindowKey
            ? {
                ...window,
                ...routeWindow,
              }
            : window,
        )
      : [...current, routeWindow]

    commitWindows(nextWindows)
    if (!search.minimized) {
      commitFocusedWindow(routeWindowKey)
    }
  }, [routeAppId, routeDocument, routeWindowKey, search.maximized, search.minimized, search.x, search.y])

  const routeForWindow = (window: WindowState | undefined) => {
    if (!window) return '/'
    if (window.app === 'notes') return window.document === 'cv' ? '/cv' : '/home'
    if (window.app === 'github') return '/github'
    if (window.app === 'skills') return '/skills'
    if (window.app === 'strava') return '/strava'

    return '/'
  }

  const persistFocusedWindow = (window: WindowState | undefined) => {
    void navigate({
      to: routeForWindow(window),
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
    commitFocusedWindow(window ? windowKey(window) : null)
    persistFocusedWindow(window)
  }

  const focusWindow = (target: WindowState) => {
    const current = windowsRef.current
    const targetKey = windowKey(target)
    const existing = current.find((window) => windowKey(window) === targetKey)

    if (!existing) return

    const nextZ = zCounter.current++
    const focused: WindowState = {
      ...existing,
      minimized: false,
      z: nextZ,
    }

    commitWindows(current.map((window) => (windowKey(window) === targetKey ? focused : window)))
    setFocusedWindow(focused)
  }

  const openApp = (app: AppId, document?: NotesDocumentId) => {
    const current = windowsRef.current
    const targetKey = windowKey({ app, document })
    const existing = current.find((window) => windowKey(window) === targetKey)
    const nextZ = zCounter.current++
    const focused: WindowState = existing
      ? {
          ...existing,
          document: document ?? existing.document,
          minimized: false,
          z: nextZ,
        }
      : {
          ...defaultWindow,
          app,
          document,
          x:
            app === 'github'
              ? 362
              : app === 'strava'
                ? 214
                : app === 'notes' && document === 'cv'
                  ? 132
                  : defaultWindow.x,
          y:
            app === 'github'
              ? 110
              : app === 'strava'
                ? 126
                : app === 'notes' && document === 'cv'
                  ? 118
                  : defaultWindow.y,
          z: nextZ,
        }

    commitWindows(
      existing
        ? current.map((window) => (windowKey(window) === targetKey ? focused : window))
        : [...current, focused],
    )
    setFocusedWindow(focused)
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>, window: WindowState) => {
    focusWindow(window)

    if (event.button !== 0 || window.maximized) return

    dragging.current = true
    draggingWindow.current = windowKey(window)
    dragOffset.current = {
      x: event.clientX - window.x,
      y: event.clientY - window.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveWindow = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !draggingWindow.current) return

    const nextX = Math.max(12, Math.min(event.clientX - dragOffset.current.x, window.innerWidth - 360))
    const nextY = Math.max(54, Math.min(event.clientY - dragOffset.current.y, window.innerHeight - 180))
    const targetKey = draggingWindow.current

    const current = windowsRef.current
    const nextWindows = current.map((window) =>
      windowKey(window) === targetKey
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
    if (!dragging.current || !draggingWindow.current) return

    const targetKey = draggingWindow.current
    dragging.current = false
    draggingWindow.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)

    const movedWindow = windowsRef.current.find((window) => windowKey(window) === targetKey)

    if (movedWindow && focusedWindowRef.current === targetKey) {
      persistFocusedWindow(movedWindow)
    }
  }

  const closeWindow = (target: WindowState) => {
    setWindowExit('close')
    const targetKey = windowKey(target)
    const current = windowsRef.current
    const remaining = current.filter((window) => windowKey(window) !== targetKey)
    const nextFocused =
      focusedWindowRef.current === targetKey
        ? topmostVisibleWindow(remaining) ?? remaining.at(-1)
        : current.find((window) => windowKey(window) === focusedWindowRef.current)

    commitWindows(remaining)
    setFocusedWindow(nextFocused)
  }

  const minimizeWindow = (target: WindowState) => {
    setWindowExit('minimize')
    const targetKey = windowKey(target)
    const current = windowsRef.current
    const minimizedWindow = current.find((window) => windowKey(window) === targetKey)

    if (!minimizedWindow) return

    const nextWindow = {
      ...minimizedWindow,
      minimized: true,
    }
    const nextWindows = current.map((window) =>
      windowKey(window) === targetKey ? nextWindow : window,
    )

    commitWindows(nextWindows)

    if (focusedWindowRef.current === targetKey) {
      setFocusedWindow(topmostVisibleWindow(nextWindows) ?? nextWindow)
    }
  }

  const toggleMaximizeWindow = (target: WindowState) => {
    const current = windowsRef.current
    const targetKey = windowKey(target)
    const existing = current.find((window) => windowKey(window) === targetKey)

    if (!existing) return

    const nextZ = zCounter.current++
    const changedWindow: WindowState = {
      ...existing,
      maximized: !existing.maximized,
      minimized: false,
      z: nextZ,
    }

    commitWindows(current.map((window) => (windowKey(window) === targetKey ? changedWindow : window)))
    setFocusedWindow(changedWindow)
  }

  return {
    closeWindow,
    focusedWindow,
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
