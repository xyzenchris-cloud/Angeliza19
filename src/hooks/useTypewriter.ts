import { useEffect, useRef, useState } from 'react'
import { playTyping } from '../lib/sfx'

export function useTypewriter(
  text: string,
  speedMs: number,
  enabled = true,
) {
  const [visibleLength, setVisibleLength] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setVisibleLength(0)
    if (!enabled || text.length === 0) return

    playTyping()
    let characterIndex = 0
    intervalRef.current = window.setInterval(() => {
      characterIndex += 1
      setVisibleLength(characterIndex)

      if (characterIndex >= text.length && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, speedMs)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, speedMs, text])

  return {
    text: text.slice(0, visibleLength),
    complete: visibleLength >= text.length,
  }
}
