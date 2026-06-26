'use client'

import { motion, useReducedMotion } from 'motion/react'

type Props = {
  /** Color of the section ABOVE the divider (fills the upper portion). */
  top?: string
  /** Color of the section BELOW the divider (the solid wave seam). */
  bottom?: string
  /** Tint for the two drifting decorative waves. */
  accent?: string
  /** Divider band height in px. */
  height?: number
  /** Mirror the wave shape horizontally for variety between dividers. */
  flip?: boolean
  /**
   * Overlay mode: render absolutely at the bottom of a `relative` parent
   * section with a transparent top, so the parent's own background (e.g. the
   * hero mesh) shows through and the wave emerges out of it. Place as the
   * last child inside that section.
   */
  overlay?: boolean
}

/**
 * An animated shaped seam between two full-bleed sections. Two translucent
 * violet waves drift in opposite directions behind a solid `bottom`-colored
 * wave that forms the clean boundary into the next section. Sits in normal
 * flow between sections, so nothing clips it.
 */
export default function SectionDivider({
  top = 'var(--color-bg)',
  bottom = 'var(--color-bg-2)',
  accent = 'var(--color-accent-subtle)',
  height = 84,
  flip = false,
  overlay = false,
}: Props) {
  const reduce = useReducedMotion()

  // Decorative paths span 2× the viewBox width so they can drift one full
  // period (1440) and loop seamlessly.
  const back =
    'M0,46 C240,18 480,74 720,46 C960,18 1200,74 1440,46 C1680,18 1920,74 2160,46 C2400,18 2640,74 2880,46 L2880,140 L0,140 Z'
  const mid =
    'M0,56 C288,88 576,24 864,56 C1152,88 1440,24 1728,56 C2016,88 2304,24 2592,56 C2736,72 2808,48 2880,56 L2880,140 L0,140 Z'
  // Solid seam — the actual color boundary into the lower section.
  const seam =
    'M0,64 C360,98 720,32 1080,60 C1260,74 1380,48 1440,58 L1440,140 L0,140 Z'

  return (
    <div
      aria-hidden
      className={
        overlay
          ? 'pointer-events-none absolute inset-x-0 bottom-0 w-full overflow-hidden leading-[0]'
          : 'relative w-full overflow-hidden leading-[0]'
      }
      style={{ height, background: overlay ? 'transparent' : top }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <motion.path
          d={back}
          fill={accent}
          style={{ opacity: 0.45 }}
          animate={reduce ? undefined : { x: [0, -1440] }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
        />
        <motion.path
          d={mid}
          fill={accent}
          style={{ opacity: 0.7 }}
          animate={reduce ? undefined : { x: [-1440, 0] }}
          transition={{ duration: 17, ease: 'linear', repeat: Infinity }}
        />
        <path d={seam} fill={bottom} />
      </svg>
    </div>
  )
}
