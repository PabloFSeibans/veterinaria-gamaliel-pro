import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
      })
    }

    function raf(time: number) {
      lenisRef.current?.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenisRef.current?.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef.current
}