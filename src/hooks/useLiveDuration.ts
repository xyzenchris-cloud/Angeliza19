import { useEffect, useState } from 'react'
import { RELATIONSHIP_START } from '../data/config'
import { getPreciseDuration, type PreciseDuration } from '../lib/dateDiff'

export function useLiveDuration(start: Date = RELATIONSHIP_START): PreciseDuration {
  const [duration, setDuration] = useState(() => getPreciseDuration(start, new Date()))

  useEffect(() => {
    const updateDuration = () => setDuration(getPreciseDuration(start, new Date()))
    const interval = window.setInterval(updateDuration, 1000)
    return () => window.clearInterval(interval)
  }, [start])

  return duration
}
