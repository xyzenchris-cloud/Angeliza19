import { motion } from 'framer-motion'
import type { PreciseDuration } from '../lib/dateDiff'
import { PawPrint } from 'lucide-react'

function DurationCounter({ duration }: { duration: PreciseDuration }) {
  const units = [
    ['Years', duration.years],
    ['Months', duration.months],
    ['Days', duration.days],
    ['Hours', duration.hours],
    ['Minutes', duration.minutes],
    ['Seconds', duration.seconds],
  ] as const

  return (
    <div className="relative mt-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {units.map(([label, value]) => (
          <motion.div
            key={label === 'Seconds' ? `${label}-${value}` : label}
          animate={label === 'Seconds' ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white/75 px-2 py-2 shadow-sm ring-1 ring-blush"
          >
            <div className="tabular-nums text-2xl font-bold leading-none text-heart-strong">{value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </div>
          </motion.div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute -right-4 -top-7 drop-shadow-sm">
        <PawPrint className="h-10 w-10" color="#8B6145" strokeWidth={1.7} />
      </div>
    </div>
  )
}

export default DurationCounter
