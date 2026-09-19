import { motion } from 'framer-motion'
import { HeartHandshake, ListChecks, Utensils } from 'lucide-react'
import type { Screen } from '../types/screens'

type ProgressDotsProps = {
  currentScreen: Screen
  unlockedIndex: number
  onNavigate: (screen: Screen) => void
}

const progressScreens: Array<{ screen: Exclude<Screen, 'cover'>; label: string }> = [
  { screen: 'catch', label: 'Catch' },
  { screen: 'quiz', label: 'Quiz' },
  { screen: 'finale', label: 'Finale' },
]

const icons = {
  catch: Utensils,
  quiz: ListChecks,
  finale: HeartHandshake,
}

function ProgressDots({ currentScreen, unlockedIndex, onNavigate }: ProgressDotsProps) {
  return (
    <nav
      aria-label="Birthday progress"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <ol className="flex w-full max-w-sm items-center justify-around gap-1 rounded-full bg-white/85 p-2 shadow-xl shadow-bubu/15 ring-1 ring-blush backdrop-blur-md">
        {progressScreens.map(({ screen, label }, index) => {
          const screenIndex = index + 1
          const unlocked = screenIndex <= unlockedIndex
          const current = currentScreen === screen
          const completed = screenIndex < unlockedIndex
          const Icon = icons[screen]

          return (
            <li key={screen} className="relative flex-1">
              <button
                type="button"
                aria-label={`${label} screen${current ? ', current' : ''}`}
                aria-current={current ? 'step' : undefined}
                disabled={!unlocked}
                onClick={() => onNavigate(screen)}
                className={`relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30 ${
                  current ? 'text-white' : unlocked ? 'text-ink' : 'cursor-not-allowed text-muted/40'
                }`}
              >
                {current && (
                <motion.span
                  layoutId="active-nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-heart-strong"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
                )}
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                <span>{label}</span>
                {completed && !current && (
                  <span aria-label="Completed" className="absolute bottom-1 h-1 w-1 rounded-full bg-heart-strong" />
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default ProgressDots
