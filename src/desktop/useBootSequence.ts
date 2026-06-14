import { useCallback, useEffect, useState } from 'react'

import { bootStorageKey } from './BootScreen'

type BootSequence = {
  /** True once the client has mounted — gate rendering on this to avoid SSR hydration mismatches. */
  ready: boolean
  /** Whether the boot screen should currently be shown. */
  showBoot: boolean
  /** Mark the boot sequence finished and remember it for return visits. */
  completeBoot: () => void
  /** Clear the stored flag so the next load replays the full sequence (handy for the Settings app). */
  replayBoot: () => void
}

export function useBootSequence(): BootSequence {
  const [ready, setReady] = useState(false)
  const [showBoot, setShowBoot] = useState(false)

  // Decide whether to boot only on the client, so server and first client
  // render agree (both render no overlay) and hydration stays clean.
  useEffect(() => {
    let alreadyBooted = false
    try {
      alreadyBooted = window.localStorage.getItem(bootStorageKey) === '1'
    } catch {
      alreadyBooted = false
    }
    setShowBoot(!alreadyBooted)
    setReady(true)
  }, [])

  const completeBoot = useCallback(() => {
    try {
      window.localStorage.setItem(bootStorageKey, '1')
    } catch {
      // Ignore storage failures (private mode etc.) — the desktop still shows.
    }
    setShowBoot(false)
  }, [])

  const replayBoot = useCallback(() => {
    try {
      window.localStorage.removeItem(bootStorageKey)
    } catch {
      // Ignore storage failures.
    }
    setShowBoot(true)
  }, [])

  return { ready, showBoot, completeBoot, replayBoot }
}
