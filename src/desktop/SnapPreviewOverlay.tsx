import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { rectForZone, type SnapZone } from './windowSnapping'

// Subtle ghost of where a dragged window will land when released near an edge.
// Rendered above other windows but never interactive (pointer-events-none).

type SnapPreviewOverlayProps = {
  zone: SnapZone
}

export function SnapPreviewOverlay({ zone }: SnapPreviewOverlayProps) {
  const [rect, setRect] = useState(() =>
    typeof window === 'undefined'
      ? { x: 0, y: 0, w: 0, h: 0 }
      : rectForZone(zone, window.innerWidth, window.innerHeight),
  )

  useEffect(() => {
    setRect(rectForZone(zone, window.innerWidth, window.innerHeight))
  }, [zone])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[60] border-2 border-dashed border-lagoon bg-lagoon/14 shadow-island"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
      }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
    />
  )
}
