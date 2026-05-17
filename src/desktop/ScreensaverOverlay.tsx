import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'

import type { ScreensaverMode } from './desktopSettings'

type ScreensaverOverlayProps = {
  mode: ScreensaverMode
  onClose: () => void
}

export function ScreensaverOverlay({ mode, onClose }: ScreensaverOverlayProps) {
  const logoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return

    const colors = ['#ff5b5f', '#2d7dff', '#22d05f', '#f0d326', '#b45cff', '#ffffff']
    let colorIndex = 0
    let animationFrame = 0
    let lastTime = performance.now()
    let x = Math.min(96, window.innerWidth * 0.16)
    let y = Math.min(80, window.innerHeight * 0.18)
    let vx = 185
    let vy = 135

    logo.style.color = colors[colorIndex]

    const changeColor = () => {
      colorIndex = (colorIndex + 1) % colors.length
      logo.style.color = colors[colorIndex]
    }

    const tick = (time: number) => {
      const elapsedSeconds = Math.min(0.035, (time - lastTime) / 1000)
      lastTime = time

      const { height, width } = logo.getBoundingClientRect()
      const maxX = Math.max(0, window.innerWidth - width)
      const maxY = Math.max(0, window.innerHeight - height)
      let hitEdge = false

      x += vx * elapsedSeconds
      y += vy * elapsedSeconds

      if (x <= 0) {
        x = 0
        vx = Math.abs(vx)
        hitEdge = true
      } else if (x >= maxX) {
        x = maxX
        vx = -Math.abs(vx)
        hitEdge = true
      }

      if (y <= 0) {
        y = 0
        vy = Math.abs(vy)
        hitEdge = true
      } else if (y >= maxY) {
        y = maxY
        vy = -Math.abs(vy)
        hitEdge = true
      }

      if (hitEdge) changeColor()

      logo.style.transform = `translate3d(${x}px, ${y}px, 0)`
      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[2147483646] overflow-hidden bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      onPointerDown={mode === 'idle' ? onClose : undefined}
      role="dialog"
      aria-label={mode === 'preview' ? 'Screensaver preview' : 'Screensaver'}
    >
      <div
        ref={logoRef}
        className="absolute left-0 top-0 h-[clamp(5rem,17vw,11rem)] w-[clamp(11rem,36vw,24rem)] will-change-transform"
        aria-hidden="true"
      >
        <svg
          className="h-full w-full overflow-visible drop-shadow-[0_0_18px_currentColor]"
          viewBox="0 0 744.09448 347.24408"
          role="img"
          aria-label="DVD logo"
        >
          <g transform="translate(-31.383578,-416.39712)">
            <g transform="translate(36.559368,120.22576)" fill="currentColor">
              <path d="M 461.65349,313.82833 C 461.65349,313.82833 423.33901,359.30605 416.17584,367.88512 C 377.94459,413.94585 371.11467,426.27316 370.03182,429.52157 C 370.19841,426.27316 368.78245,413.77925 352.45714,367.21882 C 348.12595,354.80821 334.13279,313.82833 334.13279,313.82833 L 73.510824,313.82833 L 64.348614,352.47606 L 132.81498,352.55936 L 148.89047,352.55936 C 192.95217,352.55936 219.77229,370.21734 212.35929,401.70189 C 204.19664,435.93508 165.71549,450.84443 124.81891,450.84443 L 109.49315,450.84443 L 129.40005,366.80234 L 60.933614,366.80234 L 31.781284,489.49209 L 128.98357,489.49209 C 201.94772,489.49209 271.41363,450.92773 283.57429,401.70189 C 285.82321,392.62298 285.57332,370.05075 279.9927,356.55736 C 279.90941,356.05765 279.74288,355.64117 279.24311,354.55839 C 278.99322,354.14191 278.82663,352.14288 279.9927,351.7264 C 280.65907,351.47651 281.82514,352.72595 281.99174,353.05906 C 282.49151,354.55839 282.99129,355.72446 282.99129,355.72446 L 344.79425,530.13879 L 502.13359,352.55936 L 568.76759,352.55936 L 584.84301,352.55936 C 628.82141,352.55936 655.97471,370.21734 648.47842,401.70189 C 640.31577,435.93508 601.66804,450.84443 560.77145,450.84443 L 545.36239,450.84443 L 565.35259,366.80234 L 496.88622,366.80234 L 467.73382,489.49209 L 564.85282,489.49209 C 637.90025,489.49209 707.78258,451.09425 719.52683,401.70189 C 731.27107,352.30947 679.96291,313.82833 606.58229,313.82833 L 461.65349,313.82833" />
              <path d="M 347.2097,530.88845 C 162.38379,530.88845 12.540744,552.12802 12.540744,578.36507 C 12.540744,604.51889 162.38379,625.75846 347.2097,625.75846 C 532.03559,625.75846 681.87865,604.51889 681.87865,578.36507 C 681.87865,552.12802 532.03559,530.88845 347.2097,530.88845 z M 335.13234,595.10686 C 292.90302,595.10686 258.66984,588.02705 258.66984,579.28132 C 258.66984,570.5356 292.90302,563.45578 335.13234,563.45578 C 377.27829,563.45578 411.51147,570.5356 411.51147,579.28132 C 411.51147,588.02705 377.27829,595.10686 335.13234,595.10686" />
            </g>
          </g>
        </svg>
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 text-caption font-black uppercase tracking-[0.12em] text-white/62">
        <span>DVD Screensaver</span>
        {mode === 'preview' ? (
          <button
            type="button"
            className="rounded-control border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={onClose}
          >
            Exit Preview
          </button>
        ) : (
          <span>Click or press any key</span>
        )}
      </div>
    </motion.div>
  )
}
