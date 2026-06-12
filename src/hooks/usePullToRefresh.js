import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const THRESHOLD = 70

  useEffect(() => {
    function onTouchStart(e) {
      // Only trigger if scrolled to top
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
      }
    }

    function onTouchMove(e) {
      if (!startY.current) return
      const dist = e.touches[0].clientY - startY.current
      if (dist > 0 && dist < 120) {
        setPullDistance(dist)
        setIsPulling(dist > THRESHOLD)
      }
    }

    async function onTouchEnd() {
      if (pullDistance > THRESHOLD) {
        await onRefresh()
      }
      setPullDistance(0)
      setIsPulling(false)
      startY.current = 0
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullDistance, onRefresh])

  return { isPulling, pullDistance }
}
