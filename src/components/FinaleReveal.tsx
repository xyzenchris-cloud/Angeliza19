import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { bearAssets } from '../data/bearAssets'
import { playBeat, stopSfxFile, unlockAudio } from '../lib/sfx'
import Confetti from './Confetti'
import EnvelopeHuntScene from './EnvelopeHuntScene'
import ImpactBurst from './effects/ImpactBurst'
import GifImage from './GifImage'

type FinaleRevealProps = {
  onReunion?: () => void
  introModalDismissed?: boolean
}

function FinaleReveal({ onReunion, introModalDismissed = true }: FinaleRevealProps) {
  const comicBursts = [
    { text: 'You Stinky Dudu!', position: 'left-[4%] top-24', tilt: '-rotate-6', delay: 0 },
    { text: 'Imma beat you up to death', position: 'right-[4%] top-28', tilt: 'rotate-6', delay: 0.45 },
    { text: 'Nyenyenye', position: 'left-[8%] bottom-14', tilt: 'rotate-6', delay: 0.9 },
    { text: 'Ano ha ano?', position: 'right-[8%] bottom-10', tilt: '-rotate-6', delay: 1.35 },
  ] as const
  const [reunited, setReunited] = useState(false)
  const [snapping, setSnapping] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [showImpactBurst, setShowImpactBurst] = useState(false)
  const leftBearRef = useRef<HTMLDivElement>(null)
  const rightBearRef = useRef<HTMLDivElement>(null)
  const impactTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!reunited) return
    const timeout = window.setTimeout(() => {
      stopSfxFile('beating.wav')
      setRevealed(true)
    }, 5000)
    return () => window.clearTimeout(timeout)
  }, [reunited])

  useEffect(() => {
    return () => {
      if (impactTimer.current !== null) window.clearTimeout(impactTimer.current)
    }
  }, [])

  const triggerReunion = () => {
    if (fired.current) return
    fired.current = true
    setSnapping(true)
    window.setTimeout(() => {
      setReunited(true)
      setShowImpactBurst(true)
      void playBeat()
      impactTimer.current = window.setTimeout(() => {
        setShowImpactBurst(false)
        impactTimer.current = null
      }, 150)
      onReunion?.()
    }, 500)
  }

  const handleDrag = (_side: 'left' | 'right', _event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    if (fired.current) return
    const leftBounds = leftBearRef.current?.getBoundingClientRect()
    const rightBounds = rightBearRef.current?.getBoundingClientRect()
    if (!leftBounds || !rightBounds) return

    const leftCenter = leftBounds.left + leftBounds.width / 2
    const rightCenter = rightBounds.left + rightBounds.width / 2
    if (rightCenter - leftCenter <= 80) triggerReunion()
  }

  const dragProps = (side: 'left' | 'right') => ({
    drag: 'x' as const,
    dragConstraints: side === 'left' ? { left: 0, right: 190 } : { left: -190, right: 0 },
    dragElastic: 0.04,
    onDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) =>
      handleDrag(side, event, info),
  })

  return (
    <div className="relative flex w-full flex-col items-center text-center">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="reunion"
            className="relative flex h-[26rem] w-full items-center justify-center overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 px-4 text-center">
              <h2 className="font-display text-xl font-extrabold leading-tight text-heart-strong">
                Beat Dudu because of his clumsiness.
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                Drag them together
              </p>
            </div>
            <AnimatePresence>
              {!reunited && (
                <>
                  <motion.div
                    ref={leftBearRef}
                    className="absolute left-2 top-1/2 z-10 w-28 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                    onPointerDown={() => void unlockAudio()}
                    animate={snapping ? { left: '50%', x: '-80px', zIndex: 11 } : { left: 0, x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    {...(introModalDismissed && !snapping ? dragProps('left') : {})}
                    exit={{ opacity: 0 }}
                  >
                    <span
                      className="pointer-events-none absolute -top-10 left-1/2 w-max max-w-[11rem] -translate-x-1/2 px-1 text-center text-xs font-semibold leading-tight text-heart-strong"
                      aria-hidden="true"
                    >
                      Sorry Dudu, I lost the envelope.
                    </span>
                    <GifImage
                      src={bearAssets.finaleLeft}
                      alt="Bubu"
                      className="h-28 w-auto max-w-none -scale-x-100 select-none object-contain"
                      draggable={false}
                    />
                  </motion.div>
                  <motion.div
                    ref={rightBearRef}
                    className="absolute right-2 top-1/2 z-10 w-28 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                    onPointerDown={() => void unlockAudio()}
                    animate={snapping ? { right: '50%', x: '80px', zIndex: 11 } : { right: 0, x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    {...(introModalDismissed && !snapping ? dragProps('right') : {})}
                    exit={{ opacity: 0 }}
                  >
                    <span
                      className="pointer-events-none absolute -top-10 left-1/2 w-max max-w-[11rem] -translate-x-1/2 px-1 text-center text-xs font-semibold leading-tight text-heart-strong"
                      aria-hidden="true"
                    >
                      After i hardly completing all the task!
                    </span>
                    <GifImage
                      src={bearAssets.finaleRight}
                      alt="Dudu"
                      className="h-28 w-auto max-w-none -scale-x-100 select-none object-contain"
                      draggable={false}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {reunited && (
                <motion.div
                  key="merge"
                  className="absolute inset-0 z-10 flex h-full w-full items-center justify-center"
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <GifImage
                    src={bearAssets.finaleMerge}
                    alt="Bubu and Dudu together"
                    className="h-44 w-auto max-w-none object-contain"
                    loading="eager"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {reunited && showImpactBurst && (
              <div className="impact-burst impact-burst-finale pointer-events-none absolute left-1/2 top-1/2 z-[8]">
                <ImpactBurst size={116} color="#FFD479" />
              </div>
            )}
            <AnimatePresence>
              {reunited &&
                comicBursts.map((burst) => (
                  <motion.span
                    key={burst.text}
                    className={`pointer-events-none absolute z-20 w-fit max-w-[10rem] rounded-xl border-2 border-heart-strong bg-gold px-2 py-1 text-center font-display text-xs font-extrabold leading-tight text-ink shadow-md ${burst.position} ${burst.tilt}`}
                    initial={{ opacity: 0, scale: 0.35, rotate: 0 }}
                    animate={{ opacity: 1, scale: [0.35, 1.15, 1], rotate: burst.tilt === 'rotate-6' ? 6 : -6 }}
                    transition={{ delay: burst.delay, duration: 0.35, ease: 'easeOut' }}
                  >
                    {burst.text}
                  </motion.span>
                ))}
            </AnimatePresence>
            {reunited && <Confetti />}
          </motion.div>
        ) : (
          <motion.div
            key="envelope-hunt"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <EnvelopeHuntScene introModalDismissed={introModalDismissed} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FinaleReveal
