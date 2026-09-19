import { useEffect, useRef, useState } from 'react'

export function useTypewriter(
  text: string,
  speedMs: number,
  enabled = true,
  onCharacter?: (characterIndex: number) => void,
) {
  const [visibleLength, setVisibleLength] = useState(0)
  const lastNotifiedLength = useRef(0)
  const notifiedText = useRef(text)

  useEffect(() => {
    setVisibleLength(0)
    lastNotifiedLength.current = 0
    if (!enabled) return

    const timer = window.setInterval(() => {
      setVisibleLength((length) => {
        if (length >= text.length) {
          window.clearInterval(timer)
          return length
        }
        return length + 1
      })
    }, speedMs)

    return () => window.clearInterval(timer)
  }, [enabled, speedMs, text])

  useEffect(() => {
    if (text !== notifiedText.current) {
      notifiedText.current = text
      lastNotifiedLength.current = 0
      return
    }
    if (!enabled || visibleLength <= lastNotifiedLength.current) return
    for (let index = lastNotifiedLength.current + 1; index <= visibleLength; index += 1) {
      onCharacter?.(index)
    }
    lastNotifiedLength.current = visibleLength
  }, [enabled, onCharacter, text, visibleLength])

  return {
    text: text.slice(0, visibleLength),
    complete: visibleLength >= text.length,
  }
}
