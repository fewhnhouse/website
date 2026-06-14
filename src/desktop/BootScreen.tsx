import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export const bootStorageKey = 'felixos.boot.completed'

// BIOS-style log lines that print one after another during boot.
const bootLines = [
  'FelixOS BIOS v2.6 — POST',
  'CPU ........ Wohnhaas Core @ 3.0 GHz',
  'MEM ........ 64K OK',
  'Detecting peripherals .. ok',
  'Mounting /apps ......... ok',
  'Loading desktop shell .. ok',
  'Starting window manager  ok',
] as const

const LINE_INTERVAL_MS = 420
const PROGRESS_DURATION_MS = bootLines.length * LINE_INTERVAL_MS + 600

type BootScreenProps = {
  onComplete: () => void
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const reduceMotion = useReducedMotion()
  const [visibleLines, setVisibleLines] = useState(reduceMotion ? bootLines.length : 0)
  const [progress, setProgress] = useState(reduceMotion ? 100 : 0)
  const [finishing, setFinishing] = useState(false)
  const completedRef = useRef(false)

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setFinishing(true)
  }, [])

  // Reveal log lines and fill the progress bar over time, then finish.
  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(finish, 240)
      return () => window.clearTimeout(id)
    }

    const lineTimers = bootLines.map((_, index) =>
      window.setTimeout(() => setVisibleLines(index + 1), index * LINE_INTERVAL_MS),
    )
    const progressTimer = window.setTimeout(() => setProgress(100), 60)
    const finishTimer = window.setTimeout(finish, PROGRESS_DURATION_MS + 500)

    return () => {
      lineTimers.forEach(window.clearTimeout)
      window.clearTimeout(progressTimer)
      window.clearTimeout(finishTimer)
    }
  }, [finish, reduceMotion])

  // Skippable: any click or key press jumps straight to the desktop.
  useEffect(() => {
    const skip = () => finish()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [finish])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!finishing ? (
        <motion.div
          id="felixos-boot"
          className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center overflow-hidden bg-[#1F1E1D] px-6 text-foam"
          // Start fully opaque (no fade-in) so the desktop is never briefly
          // visible behind the overlay. Only the exit fades out.
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-label="FelixOS boot sequence"
        >
          <div className="flex w-full max-w-md flex-col gap-7">
            <div className="flex flex-col items-center gap-3 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center border-2 border-foam bg-lagoon font-display text-2xl text-foam"
                aria-hidden="true"
              >
                F
              </span>
              <h1 className="font-display text-lg uppercase tracking-[0.12em] text-foam sm:text-xl">
                FelixOS
              </h1>
              <p className="font-mono text-caption uppercase tracking-[0.18em] text-foam/60">
                booting…
              </p>
            </div>

            <div className="min-h-[8.75rem] font-mono text-caption leading-relaxed text-foam/80 sm:text-meta">
              {bootLines.slice(0, visibleLines).map((line) => (
                <div key={line} className="flex gap-2">
                  <span className="text-lagoon">{'>'}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-3 w-full border-2 border-foam/70 p-[2px]">
                <motion.div
                  className="h-full bg-lagoon"
                  initial={reduceMotion ? false : { width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: reduceMotion ? 0 : PROGRESS_DURATION_MS / 1000,
                    ease: 'linear',
                  }}
                />
              </div>
              <p className="text-center font-mono text-caption uppercase tracking-[0.18em] text-foam/45">
                Click or press any key to skip
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
