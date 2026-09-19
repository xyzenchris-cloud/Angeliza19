import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { playClick } from '../lib/sfx'
import pawImage from '../assets/ui/paw.png'

type PawParticle = {
  id: number
  x: number
  y: number
  rotation: number
}

const MIN_INTERVAL = 90
const PAW_LIFETIME = 3000
const RIPPLE_LIFETIME = 580

function FallbackPaw() {
  return (
    <svg
      aria-hidden="true"
      className="h-14 w-14 drop-shadow-sm"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 15.6c-2.9 0-5.2 2.2-5.2 5 0 2.6 2.1 4.2 5.2 4.2s5.2-1.6 5.2-4.2c0-2.8-2.3-5-5.2-5Z"
        fill="#B98764"
      />
      <ellipse cx="8.2" cy="12.2" rx="2.8" ry="4" transform="rotate(-25 8.2 12.2)" fill="#B98764" />
      <ellipse cx="13.1" cy="8.2" rx="2.8" ry="4" transform="rotate(-9 13.1 8.2)" fill="#B98764" />
      <ellipse cx="18.9" cy="8.2" rx="2.8" ry="4" transform="rotate(9 18.9 8.2)" fill="#B98764" />
      <ellipse cx="23.8" cy="12.2" rx="2.8" ry="4" transform="rotate(25 23.8 12.2)" fill="#B98764" />
    </svg>
  )
}

function PawGraphic() {
  const [imageFailed, setImageFailed] = useState(false)
  if (imageFailed) return <FallbackPaw />
  return (
    <img
      src={pawImage}
      alt=""
      className="h-14 w-14 object-contain drop-shadow-sm"
      onError={() => setImageFailed(true)}
    />
  )
}

function PawClickEffect() {
  const [particles, setParticles] = useState<PawParticle[]>([])
  const [ripples, setRipples] = useState<PawParticle[]>([])
  const nextId = useRef(0)
  const lastSpawnAt = useRef(0)
  const timers = useRef<ReturnType<typeof window.setTimeout>[]>([])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const now = performance.now()
      if (now - lastSpawnAt.current < MIN_INTERVAL) return
      lastSpawnAt.current = now

      const id = nextId.current++
      setParticles((current) => [
        ...current.slice(-11),
        {
          id,
          x: event.clientX,
          y: event.clientY,
          rotation: Math.round(Math.random() * 30 - 15),
        },
      ])
      setRipples((current) => [
        ...current.slice(-15),
        {
          id,
          x: event.clientX,
          y: event.clientY,
          rotation: 0,
        },
      ])
      void playClick()

      const rippleTimer = window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id))
        timers.current = timers.current.filter((activeTimer) => activeTimer !== rippleTimer)
      }, RIPPLE_LIFETIME)
      timers.current.push(rippleTimer)

      const timer = window.setTimeout(() => {
        setParticles((current) => current.filter((particle) => particle.id !== id))
        timers.current = timers.current.filter((activeTimer) => activeTimer !== timer)
      }, PAW_LIFETIME)
      timers.current.push(timer)
    }

    document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {ripples.map((ripple) => (
        <motion.span
          key={`ripple-${ripple.id}`}
          className="absolute -ml-4 -mt-4 h-8 w-8 rounded-full border-2 border-heart/45"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.3, 1.25, 2.8] }}
          transition={{ duration: RIPPLE_LIFETIME / 1000, ease: 'easeOut' }}
        />
      ))}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute -ml-7 -mt-7 text-bubu"
          style={{ left: particle.x, top: particle.y }}
          initial={{ opacity: 0, scale: 0.72, rotate: particle.rotation, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.92], y: [0, 0, 0, -8] }}
          transition={{ duration: PAW_LIFETIME / 1000, times: [0, 0.06, 0.84, 1], ease: 'easeInOut' }}
        >
          <PawGraphic />
        </motion.div>
      ))}
    </div>
  )
}

export default PawClickEffect
