import { useEffect, useRef } from 'react'
import { useInView, useAnimation } from 'motion/react'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const inView = useInView(ref, { once: true, amount: threshold })

  useEffect(() => {
    if (inView) controls.start('visible')
  }, [inView, controls])

  return { ref, controls }
}
