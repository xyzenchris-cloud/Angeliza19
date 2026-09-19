import { useEffect, useState } from 'react'

type Particle = {
  id: number
  left: number
  delay: number
  duration: number
  rotate: number
  shape: 'circle' | 'bar' | 'diamond'
}

function Confetti() {
  const [visible, setVisible] = useState(true)
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 32 }, (_, id) => ({
      id,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 0.7,
      duration: 2.2 + Math.random() * 0.9,
      rotate: -120 + Math.random() * 240,
      shape: id % 3 === 0 ? 'circle' : id % 3 === 1 ? 'bar' : 'diamond',
    })),
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 3000)
    return () => window.clearTimeout(timeout)
  }, [])

  if (!visible) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`absolute top-1/3 animate-[confetti-fall_var(--duration)_ease-in_forwards] ${
            particle.shape === 'circle'
              ? 'h-2.5 w-2.5 rounded-full bg-heart'
              : particle.shape === 'bar'
                ? 'h-1.5 w-4 rounded-full bg-gold'
                : 'h-2.5 w-2.5 rotate-45 bg-blush'
          }`}
          style={{
            left: `${particle.left}%`,
            '--duration': `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotate}deg)`,
          } as React.CSSProperties}
        >
        </span>
      ))}
    </div>
  )
}

export default Confetti
