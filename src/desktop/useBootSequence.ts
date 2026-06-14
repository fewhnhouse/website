import { useCallback, useEffect, useState } from 'react'

import { bootStorageKey } from './BootScreen'

type BootSequence = {
  /** Whether the boot screen should currently be shown. */
  showBoot: boolean
  /** Mark the boot sequence finished and remember it for return visits. */
  completeBoot: () => void
  /** Clear the stored flag so the next load replays the full sequence (handy for the Settings app). */
  replayBoot: () => void
}

export function useBootSequence(): BootSequence {
  // Default to `true` so the overlay is part of the server-rendered HTML and
  // covers the desktop from the very first paint (no flash of the desktop).
  // For return visitors a pre-paint inline script (see RootDocument) hides the
  // overlay before paint via the `data-boot-done` attribute, and the effect
  // below unmounts it right after hydration.
  const [showBoot, setShowBoot] = useState(true)

  useEffect(() => {
    let alreadyBooted = false
    try {
      alreadyBooted = window.localStorage.getItem(bootStorageKey) === '1'
    } catch {
      alreadyBooted = false
    }
    if (alreadyBooted) setShowBoot(false)
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
    try {
      // Drop the pre-paint guard so the replayed sequence is actually visible.
      document.documentElement.removeAttribute('data-boot-done')
    } catch {
      // Ignore — attribute may not be present.
    }
    setShowBoot(true)
  }, [])

  return { showBoot, completeBoot, replayBoot }
}
