import { AnimatePresence, motion } from 'framer-motion'
import { Component, useEffect, useState, type ReactNode } from 'react'
import CoverScreen from './components/CoverScreen'
import CatchGame from './components/CatchGame'
import Quiz from './components/Quiz'
import FinaleReveal from './components/FinaleReveal'
import ProgressDots from './components/ProgressDots'
import PawClickEffect from './components/PawClickEffect'
import GameIntroModal from './components/GameIntroModal'
import { PawPrint, Heart } from 'lucide-react'
import type { Screen } from './types/screens'
import { stopScreenAudio } from './lib/sfx'
import { preloadAllAssets } from './lib/gifPreloader'
import { gifAssets } from './data/gifAssets'
import LoadingScreen from './components/LoadingScreen'

const screens: Screen[] = ['cover', 'catch', 'quiz', 'finale']

type ErrorBoundaryState = { hasError: boolean }

export class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[app] React render error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-center font-body text-ink">
          <div>
            <div aria-hidden="true" className="mb-4 flex justify-center gap-2">
              <PawPrint className="h-12 w-12" color="#8B6145" strokeWidth={1.7} />
              <Heart className="h-12 w-12" color="#A92F49" fill="#FFD6E0" strokeWidth={1.7} />
            </div>
            <h1 className="font-display text-3xl font-bold">Something went a little wonky.</h1>
            <p className="mt-3 text-lg text-muted">Please refresh to try the birthday adventure again.</p>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

function App() {
  const [assetsReady, setAssetsReady] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[app] Uncaught browser error', event.error ?? event.message, {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    }
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[app] Unhandled promise rejection', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    let active = true
    const timeout = window.setTimeout(() => {
      if (active) setAssetsReady(true)
    }, 4500)

    void preloadAllAssets().then(() => {
      if (active) setAssetsReady(true)
    })

    return () => {
      active = false
      window.clearTimeout(timeout)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <>
      <AppContent />
      <AnimatePresence>{!assetsReady && <LoadingScreen />}</AnimatePresence>
    </>
  )
}

function AppContent() {
  const [unlockedIndex, setUnlockedIndex] = useState(0)
  const [currentScreen, setCurrentScreen] = useState<Screen>('cover')
  const [gameIntroDismissed, setGameIntroDismissed] = useState(false)
  const [quizIntroDismissed, setQuizIntroDismissed] = useState(false)
  const [quizIntroReady, setQuizIntroReady] = useState(false)
  const [finaleIntroDismissed, setFinaleIntroDismissed] = useState(false)

  const advance = () => {
    stopScreenAudio()
    if (currentScreen === 'cover') {
      setUnlockedIndex((index) => Math.max(index, 1))
      setCurrentScreen('catch')
      return
    }
    if (currentScreen === 'finale') {
      setUnlockedIndex(0)
      setCurrentScreen('cover')
      return
    }
    const nextIndex = Math.min(screens.length - 1, screens.indexOf(currentScreen) + 1)
    setUnlockedIndex((index) => Math.max(index, nextIndex))
    setCurrentScreen(screens[nextIndex])
  }

  const navigateTo = (screen: Screen) => {
    if (screens.indexOf(screen) <= unlockedIndex) {
      stopScreenAudio()
      setCurrentScreen(screen)
    }
  }

  return (
    <main className="app-shell min-h-screen w-full overflow-x-hidden bg-cream font-body text-ink">
      <PawClickEffect />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="ambient-blob ambient-blob-one" />
        <div className="ambient-blob ambient-blob-two" />
        <div className="ambient-blob ambient-blob-three" />
      </div>
      {currentScreen !== 'cover' && (
        <ProgressDots
          currentScreen={currentScreen}
          unlockedIndex={unlockedIndex}
          onNavigate={navigateTo}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentScreen}
          className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97, filter: 'blur(3px)', transition: { duration: 0.425, ease: [0.4, 0, 0.2, 1] } }}
          transition={{ duration: 0.525, ease: [0.4, 0, 0.2, 1] }}
        >
          <ScreenContent
            screen={currentScreen}
            onContinue={advance}
            gameIntroDismissed={gameIntroDismissed}
            quizIntroDismissed={quizIntroDismissed}
            quizIntroReady={quizIntroReady}
            finaleIntroDismissed={finaleIntroDismissed}
          />
        </motion.section>
      </AnimatePresence>
      {currentScreen === 'catch' && (
        <GameIntroModal
          open={!gameIntroDismissed}
          onDismiss={() => setGameIntroDismissed(true)}
          gif={gifAssets.catchIntro}
          title="A tiny challenge first!"
          message="You have to get through these first! Beat the games to unlock your surprise message."
          buttonLabel="Let's play »"
          introSound="mwehehe.wav"
        />
      )}
      {currentScreen === 'quiz' && (
        <GameIntroModal
          open={!quizIntroDismissed}
          onDismiss={() => setQuizIntroDismissed(true)}
          onDismissComplete={() => setQuizIntroReady(true)}
          gif={gifAssets.quizIntro}
          title="Quiz time Baby Riya"
          message="Double check kung ikaw ba, because this message is only meant to you"
          buttonLabel="Bring it on »"
          gifAlt="Bubu and Dudu ready for a quiz"
          introSound="mwehehe.wav"
        />
      )}
      {currentScreen === 'finale' && (
        <GameIntroModal
          open={!finaleIntroDismissed}
          onDismiss={() => setFinaleIntroDismissed(true)}
          gif={gifAssets.finaleLeft}
          gifClassName="-scale-x-100"
          title="Uh oh — Dudu lost the envelopes!"
          message="Help Dudu find the missing envelopes hidden around here."
          buttonLabel="Let's find it »"
          gifAlt="Bubu looking for Dudu's lost letter envelope"
          introSound="ohno.wav"
        />
      )}
    </main>
  )
}

function ScreenContent({
  screen,
  onContinue,
  gameIntroDismissed,
  quizIntroDismissed,
  quizIntroReady,
  finaleIntroDismissed,
}: {
  screen: Screen
  onContinue: () => void
  gameIntroDismissed: boolean
  quizIntroDismissed: boolean
  quizIntroReady: boolean
  finaleIntroDismissed: boolean
}) {
  if (screen === 'cover') return <CoverScreen onContinue={onContinue} />
  if (screen === 'catch') return <CatchGame onContinue={onContinue} introModalDismissed={gameIntroDismissed} />
  if (screen === 'quiz') {
    return (
      <Quiz
        onContinue={onContinue}
        introModalDismissed={quizIntroDismissed}
        introModalReady={quizIntroReady}
      />
    )
  }
  if (screen === 'finale') {
    return <FinaleReveal onReunion={() => undefined} introModalDismissed={finaleIntroDismissed} />
  }
  return <FinaleReveal onReunion={() => undefined} introModalDismissed={finaleIntroDismissed} />
}

export default App
