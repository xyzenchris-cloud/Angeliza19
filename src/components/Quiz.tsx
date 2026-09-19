import { motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HER_NAME } from '../data/config'
import { gifAssets } from '../data/gifAssets'
import { quizQuestions, type QuizQuestion } from '../data/quiz'
import { playSfxFile, playSuccess, playTyping } from '../lib/sfx'
import Bear from './Bear'
import GifImage from './GifImage'
import PrimaryButton from './PrimaryButton'

const STARTING_LIVES = 3
const TYPE_SPEED_MS = 110
const OPTION_STAGGER_MS = 420

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

type QuizProps = {
  onContinue: () => void
  introModalDismissed?: boolean
  introModalReady?: boolean
}

function QuizQuestionText({
  question,
  enabled,
  onComplete,
}: {
  question: QuizQuestion
  enabled: boolean
  onComplete: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const intervalRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayed('')
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (!enabled) return

    playTyping()
    let characterIndex = 0
    intervalRef.current = window.setInterval(() => {
      characterIndex += 1
      setDisplayed(question.question.slice(0, characterIndex))
      if (characterIndex >= question.question.length && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
        onCompleteRef.current()
      }
    }, TYPE_SPEED_MS)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, question.id])

  return (
    <>
      {displayed}
      {displayed.length < question.question.length && <span className="typing-cursor" aria-hidden="true">|</span>}
    </>
  )
}

function Quiz({ onContinue, introModalDismissed = true, introModalReady = introModalDismissed }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [failModalClosing, setFailModalClosing] = useState(false)
  const [quizReady, setQuizReady] = useState(introModalReady && introModalDismissed)
  const [questionTypingComplete, setQuestionTypingComplete] = useState(false)
  const [lives, setLives] = useState(STARTING_LIVES)
  const [lostHeartIndex, setLostHeartIndex] = useState<number | null>(null)
  const [shuffledOptions] = useState(() =>
    quizQuestions.map((question) => shuffle(question.options)),
  )
  const question = quizQuestions[currentIndex]
  const options = useMemo(() => shuffledOptions[currentIndex], [currentIndex, shuffledOptions])
  const isCorrect = selectedOption !== null && question.correctAnswers.includes(selectedOption)
  useEffect(() => {
    setQuizReady(introModalReady && introModalDismissed)
  }, [introModalDismissed, introModalReady])

  useEffect(() => {
    setQuestionTypingComplete(false)
  }, [question.id])

  useEffect(() => {
    if (!questionTypingComplete || !quizReady) return
    const timers = options.map((_, index) =>
      window.setTimeout(() => void playSfxFile('pop.wav', 0.5), index * OPTION_STAGGER_MS),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [options, questionTypingComplete, quizReady])

  useEffect(() => {
    if (!answered) return
    const delay = isCorrect ? 1000 : 550
    const timeout = window.setTimeout(() => {
      setAnswered(false)
      setSelectedOption(null)
      if (isCorrect) {
        if (currentIndex === quizQuestions.length - 1) setShowSummary(true)
        else setCurrentIndex((index) => index + 1)
      }
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [answered, currentIndex, isCorrect])

  useEffect(() => {
    if (showSummary) void playSfxFile('happy.wav', 0.3)
  }, [showSummary])

  const resetQuiz = () => {
    setFailModalClosing(true)
    window.setTimeout(() => {
      setCurrentIndex(0)
      setAnswered(false)
      setSelectedOption(null)
      setLives(STARTING_LIVES)
      setLostHeartIndex(null)
      setShowFailModal(false)
      setFailModalClosing(false)
      setShowSummary(false)
    }, 220)
  }

  const handleAnswer = (option: string) => {
    if (answered || !quizReady || !questionTypingComplete) return
    const correct = question.correctAnswers.includes(option)
    setSelectedOption(option)
    setAnswered(true)
    if (correct) {
      playSuccess()
      return
    }

    void playSfxFile('error.wav')
    if ('vibrate' in navigator) navigator.vibrate([45, 35, 45])
    const lostIndex = lives - 1
    setLostHeartIndex(lostIndex)
    setLives((value) => Math.max(0, value - 1))
    if (lives <= 1) {
      window.setTimeout(() => setShowFailModal(true), 650)
      void playSfxFile('Crying.wav')
    }
  }

  if (showSummary) {
    return (
      <div className="text-center">
        <GifImage
          src={gifAssets.quizResult}
          alt="Bubu and Dudu celebrating"
          className="mx-auto mb-4 h-32 w-auto object-contain"
          loading="eager"
          draggable={false}
        />
        <h2 className="font-display text-4xl font-extrabold text-ink">100% Verified {HER_NAME}</h2>
        <p className="mt-3 text-lg text-muted">Ang baby bechog ko pala talaga &apos;to, no doubt!</p>
        <PrimaryButton className="mx-auto mt-7" onClick={onContinue}>
          Continue »
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-bold text-heart-strong">
          Question {currentIndex + 1} of {quizQuestions.length}
        </p>
        <p aria-label={`${lives} lives remaining`} className="flex gap-1">
          {Array.from({ length: STARTING_LIVES }, (_, index) => {
            const full = index < lives
            const losing = index === lostHeartIndex
            return (
              <motion.span
                key={index}
                className="inline-block"
                animate={losing ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
                transition={losing ? { duration: 0.35, ease: 'easeOut' } : { duration: 0 }}
              >
                <Heart
                  aria-hidden="true"
                  className="h-6 w-6"
                  color={full ? '#A92F49' : '#77553F'}
                  fill={full ? '#FF6B81' : 'none'}
                  strokeWidth={1.8}
                />
              </motion.span>
            )
          })}
        </p>
      </div>

      <p className="mb-2 min-h-6 text-sm font-bold uppercase tracking-wide text-heart-strong">
        {questionTypingComplete ? 'Choose your answer' : 'Thinking...'}
      </p>
      <h2 className="min-h-[4.5rem] font-display text-3xl font-bold leading-tight text-ink">
        <QuizQuestionText
          question={question}
          enabled={quizReady}
          onComplete={() => setQuestionTypingComplete(true)}
        />
      </h2>
      <div className="my-5">
        <Bear character="dudu" pose={answered ? (isCorrect ? 'happy' : 'sad') : 'idle'} />
      </div>
      <div className="flex min-h-[13.5rem] flex-col gap-3" role="group" aria-label="Answer options">
        {questionTypingComplete &&
          options.map((option, index) => {
            const selected = selectedOption === option
            const correct = answered && selected && isCorrect
            const incorrect = answered && selected && !isCorrect
            return (
              <motion.button
                key={option}
                type="button"
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * (OPTION_STAGGER_MS / 1000), type: 'spring', stiffness: 430, damping: 18 }}
                disabled={answered || !quizReady}
                onClick={() => handleAnswer(option)}
                className={`min-h-12 w-full rounded-2xl border-2 bg-white/75 px-4 py-3 text-left text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30 disabled:cursor-default ${
                  correct
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-200'
                    : incorrect
                      ? 'animate-[quiz-shake_0.35s_ease-in-out] border-heart-strong text-heart-strong'
                      : selected
                        ? 'border-heart'
                        : 'border-transparent text-ink hover:border-blush'
                }`}
              >
                {option}
              </motion.button>
            )
          })}
      </div>
      {answered && (
        <p className="mt-4 min-h-7 font-semibold text-heart-strong" role="status">
          {isCorrect ? (
            'Correct! You know her so well.'
          ) : (
            <span className="inline-flex items-center gap-1">
              <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} /> Not quite — try again!
            </span>
          )}
        </p>
      )}
      {showFailModal && (
        <div
          className={`modal-backdrop${failModalClosing ? ' modal-backdrop-closing' : ''}`}
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={`modal-card${failModalClosing ? ' modal-card-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-fail-title"
            aria-describedby="quiz-fail-description"
          >
            <GifImage
              src={gifAssets.catchLose}
              alt="Crying Bubu and Dudu"
              className="mx-auto mb-3 h-28 w-auto max-w-[75%] object-contain"
              loading="eager"
              draggable={false}
            />
            <h2 id="quiz-fail-title" className="font-display text-3xl font-bold text-ink">
              Wait... you&apos;re not Angeliza?!
            </h2>
            <p id="quiz-fail-description" className="mt-2 text-muted">Let&apos;s try that again.</p>
            <PrimaryButton className="relative z-30 mx-auto mt-5" onClick={resetQuiz}>
              Try again
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz
