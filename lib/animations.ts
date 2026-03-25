import type { Variants } from 'motion/react'

// ─── Entry Animations ────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 1.02, 0.73, 0.99] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.21, 1.02, 0.73, 0.99] },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.21, 1.02, 0.73, 0.99] },
  },
}

// ─── Stagger Containers ──────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

// ─── Hero Sequence ────────────────────────────────────────────────────────────

export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

// ─── Card Hover ───────────────────────────────────────────────────────────────

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

export const cardHoverGlow = {
  rest: { boxShadow: '0 0 0px oklch(0 0 0 / 0)' },
  hover: {
    boxShadow: '0 0 32px var(--color-accent-subtle)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
}

// ─── Button ───────────────────────────────────────────────────────────────────

export const buttonTap = {
  tap: { scale: 0.97 },
}
