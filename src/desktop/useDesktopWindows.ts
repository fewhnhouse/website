import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { defaultWindow } from './routeState'
import { windowKey, type AppId, type DesktopSearch, type NotesDocumentId, type RouteApp, type WindowState } from './types'
import { defaultPlacementForApp, ensureWindowInViewport } from './windowPlacement'
import { rectForZone, snapZoneFromPointer, type SnapZone } from './windowSnapping'

let rememberedWindows: WindowState[] | null = null
let rememberedFocusedWindow: string | null = null
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

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

const routeSearchForApp = (app: AppId, search: DesktopSearch): DesktopSearch => {
  const searchParams =
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search)
  const hasRouteX = (searchParams?.has('x') ?? false) && search.x !== defaultWindow.x
  const hasRouteY = (searchParams?.has('y') ?? false) && search.y !== defaultWindow.y
  const centeredPlacement = defaultPlacementForApp(app)
  const placement =
    hasRouteX || hasRouteY
      ? {
          x: hasRouteX ? search.x : centeredPlacement.x,
          y: hasRouteY ? search.y : centeredPlacement.y,
        }
      : centeredPlacement

  return {
    ...search,
    ...ensureWindowInViewport(app, placement),
  }
}

export function useDesktopWindows(routeApp: RouteApp) {
  const search = useSearch({ strict: false }) as DesktopSearch
  const navigate = useNavigate()
  const routeAppId = routeApp === 'none' ? null : routeApp.app
  const routeDocument = routeApp === 'none' ? undefined : routeApp.document
  const routeUrl = routeApp === 'none' ? undefined : routeApp.url
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
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const draggingWindow = useRef<string | null>(null)
  const snapPreviewRef = useRef<SnapZone | null>(null)
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

  useIsomorphicLayoutEffect(() => {
    if (!routeAppId || !routeWindowKey) return

    const current = windowsRef.current
    const existing = current.find((window) => windowKey(window) === routeWindowKey)
    const nextZ = zCounter.current++
    const routeWindow: WindowState = {
      ...routeSearchForApp(routeAppId, search),
      app: routeAppId,
      document: routeDocument,
      url: routeUrl,
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
  }, [
    routeAppId,
    routeDocument,
    routeUrl,
    routeWindowKey,
    search.maximized,
    search.minimized,
    search.url,
    search.x,
    search.y,
  ])

  // On a fresh desktop load at the root (no window in the URL, nothing
  // remembered this session), open home.mdx by default — mirroring the mobile
  // view, which shows home at "/". Mount-only so it never re-fires when the
  // user later returns to "/" by closing their last window (which would make
  // the home window impossible to close). Client-only via the isomorphic
  // layout effect, so SSR renders an empty desktop and hydration matches; the
  // URL is intentionally left as "/".
  const didOpenDefaultHome = useRef(false)
  useIsomorphicLayoutEffect(() => {
    if (didOpenDefaultHome.current) return
    didOpenDefaultHome.current = true
    if (routeApp !== 'none' || windowsRef.current.length > 0) return

    const homeWindow: WindowState = {
      ...defaultWindow,
      ...defaultPlacementForApp('notes'),
      app: 'notes',
      document: 'home',
      z: zCounter.current++,
    }
    commitWindows([homeWindow])
    commitFocusedWindow(windowKey({ app: 'notes', document: 'home' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const routeForWindow = (window: WindowState | undefined) => {
    if (!window) return '/'
    if (window.app === 'ask') return '/ask'
    if (window.app === 'browser') return '/browser'
    if (window.app === 'contact') return '/contact'
    if (window.app === 'game') return '/game'
    if (window.app === 'notes') return window.document === 'cv' ? '/cv' : '/home'
    if (window.app === 'github') return '/github'
    if (window.app === 'guestbook') return '/guestbook'
    if (window.app === 'help') return '/help'
    if (window.app === 'issues') return '/issues'
    if (window.app === 'settings') return '/settings'
    if (window.app === 'strava') return '/strava'
    if (window.app === 'terminal') return '/terminal'

    return '/'
  }

  const persistFocusedWindow = (window: WindowState | undefined) => {
    if (!window) {
      void navigate({ to: '/', search: defaultWindow })
      return
    }

    void navigate({
      to: routeForWindow(window),
      search: {
        maximized: window.maximized,
        minimized: window.minimized,
        ...(window.app === 'browser' && window.url ? { url: window.url } : {}),
        x: Math.round(window.x),
        y: Math.round(window.y),
        ...(window.w !== undefined && window.h !== undefined
          ? { w: Math.round(window.w), h: Math.round(window.h) }
          : {}),
      },
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
          ...defaultPlacementForApp(app),
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

    const draggedWindow = windowsRef.current.find(
      (window) => windowKey(window) === draggingWindow.current,
    )

    if (!draggedWindow) return

    const nextPlacement = ensureWindowInViewport(draggedWindow.app, {
      x: event.clientX - dragOffset.current.x,
      y: event.clientY - dragOffset.current.y,
    })
    const targetKey = draggingWindow.current

    // Dragging a tiled window restores it to its default size as it leaves the
    // snapped region (macOS-style "tear off"). The snap preview decides where
    // it lands on release.
    const current = windowsRef.current
    const nextWindows = current.map((window) =>
      windowKey(window) === targetKey
        ? {
            ...window,
            ...nextPlacement,
            w: undefined,
            h: undefined,
          }
        : window,
    )

    commitWindows(nextWindows)

    const nextZone = snapZoneFromPointer(
      event.clientX,
      event.clientY,
      window.innerWidth,
      window.innerHeight,
    )

    if (nextZone !== snapPreviewRef.current) {
      snapPreviewRef.current = nextZone
      setSnapPreview(nextZone)
    }
  }

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !draggingWindow.current) return

    const targetKey = draggingWindow.current
    const zone = snapPreviewRef.current
    dragging.current = false
    draggingWindow.current = null
    snapPreviewRef.current = null
    setSnapPreview(null)
    event.currentTarget.releasePointerCapture(event.pointerId)

    if (zone) {
      applySnapZone(targetKey, zone)
      return
    }

    const movedWindow = windowsRef.current.find((window) => windowKey(window) === targetKey)

    if (movedWindow && focusedWindowRef.current === targetKey) {
      persistFocusedWindow(movedWindow)
    }
  }

  const applySnapZone = (targetKey: string, zone: SnapZone) => {
    const current = windowsRef.current
    const existing = current.find((window) => windowKey(window) === targetKey)

    if (!existing || typeof window === 'undefined') return

    const nextZ = zCounter.current++
    const snapped: WindowState =
      zone === 'maximize'
        ? {
            ...existing,
            maximized: true,
            minimized: false,
            w: undefined,
            h: undefined,
            z: nextZ,
          }
        : (() => {
            const rect = rectForZone(zone, window.innerWidth, window.innerHeight)
            return {
              ...existing,
              maximized: false,
              minimized: false,
              x: rect.x,
              y: rect.y,
              w: rect.w,
              h: rect.h,
              z: nextZ,
            }
          })()

    commitWindows(current.map((win) => (windowKey(win) === targetKey ? snapped : win)))
    setFocusedWindow(snapped)
  }

  const snapFocusedWindow = (zone: SnapZone | 'restore') => {
    const targetKey = focusedWindowRef.current
    if (!targetKey) return

    const current = windowsRef.current
    const existing = current.find((window) => windowKey(window) === targetKey)
    if (!existing) return

    if (zone === 'restore') {
      const nextZ = zCounter.current++
      const restored: WindowState = {
        ...existing,
        maximized: false,
        w: undefined,
        h: undefined,
        z: nextZ,
      }
      commitWindows(current.map((win) => (windowKey(win) === targetKey ? restored : win)))
      setFocusedWindow(restored)
      return
    }

    applySnapZone(targetKey, zone)
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
    snapFocusedWindow,
    snapPreview,
    startDrag,
    stopDrag,
    toggleMaximizeWindow,
    windowExit,
    windows,
  }
}
