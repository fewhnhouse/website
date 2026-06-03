import type { WindowState } from './types'

export function windowAnimationFor(window: WindowState) {
  return window.maximized
    ? {
        x: 0,
        y: 42,
        width: '100vw',
        height: 'calc(100svh - 130px)',
        scale: 1,
        opacity: 1,
      }
    : {
        x: window.x,
        y: window.y,
        width:
          window.app === 'browser' ||
          window.app === 'github' ||
          window.app === 'strava'
            ? 'min(920px, calc(100vw - 1.5rem))'
            : window.app === 'help' || window.app === 'settings'
              ? 'min(680px, calc(100vw - 1.5rem))'
              : window.app === 'issues'
                ? 'min(980px, calc(100vw - 1.5rem))'
                : window.app === 'terminal'
                  ? 'min(760px, calc(100vw - 1.5rem))'
                  : 'min(720px, calc(100vw - 1.5rem))',
        height: 'auto',
        scale: 1,
        opacity: 1,
      }
}

export function windowExitAnimation(window: WindowState, windowExit: 'close' | 'minimize') {
  const exitEase = [0.22, 1, 0.36, 1] as const
  const closeEase = [0.4, 0, 0.2, 1] as const

  return windowExit === 'minimize'
    ? {
        x: 'calc(50vw - 120px)',
        y: 'calc(100vh - 86px)',
        opacity: 0,
        scale: 0.22,
        filter: 'blur(12px)',
        transition: { duration: 0.26, ease: exitEase },
      }
    : {
        opacity: 0,
        scale: 0.88,
        y: window.y + 16,
        filter: 'blur(12px)',
        transition: { duration: 0.2, ease: closeEase },
      }
}
