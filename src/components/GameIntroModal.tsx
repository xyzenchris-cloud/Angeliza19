import PrimaryButton from './PrimaryButton'
import { useEffect, useRef, useState } from 'react'
import GifImage from './GifImage'
import { playSfxFile, stopSfxFile } from '../lib/sfx'
import { useTypewriter } from '../hooks/useTypewriter'

type GameIntroModalProps = {
  open: boolean
  onDismiss: () => void
  gif: string
  message: string
  buttonLabel: string
  title: string
  gifAlt?: string
  gifClassName?: string
  introSound?: string
  onDismissComplete?: () => void
}

function GameIntroModal({
  open,
  onDismiss,
  gif,
  message,
  buttonLabel,
  title,
  gifAlt = 'Bubu and Dudu inviting you to play',
  gifClassName = '',
  introSound,
  onDismissComplete,
}: GameIntroModalProps) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const typedMessage = useTypewriter(message, 35, open)
  const closeTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const soundTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  useEffect(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }

    if (open) {
      setMounted(true)
      setClosing(false)
      return
    }

    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
      closeTimer.current = null
      onDismissComplete?.()
    }, 220)

    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = null
      }
    }
  }, [onDismissComplete, open])

  useEffect(() => {
    if (soundTimer.current !== null) {
      window.clearTimeout(soundTimer.current)
      soundTimer.current = null
    }

    if (!introSound) return
    if (open) {
      soundTimer.current = window.setTimeout(() => {
        void playSfxFile(introSound)
        soundTimer.current = null
      }, 800)
    } else {
      stopSfxFile(introSound)
    }

    return () => {
      if (soundTimer.current !== null) {
        window.clearTimeout(soundTimer.current)
        soundTimer.current = null
      }
      stopSfxFile(introSound)
    }
  }, [introSound, open])

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
      }
      if (soundTimer.current !== null) {
        window.clearTimeout(soundTimer.current)
      }
    }
  }, [])

  const handleDismiss = () => {
    if (soundTimer.current !== null) {
      window.clearTimeout(soundTimer.current)
      soundTimer.current = null
    }
    if (introSound) stopSfxFile(introSound)
    onDismiss()
  }

  return (
    <>
      {mounted && (
        <div
          className={`modal-backdrop${closing ? ' modal-backdrop-closing' : ''}`}
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={`modal-card${closing ? ' modal-card-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-intro-title"
            aria-describedby="game-intro-description"
          >
            <GifImage
              src={gif}
              alt={gifAlt}
              className={`mx-auto mb-4 h-32 w-auto object-contain ${gifClassName}`}
              loading="eager"
              draggable={false}
            />
            <h2 id="game-intro-title" className="font-display text-3xl font-extrabold text-ink">
              {title}
            </h2>
            <p id="game-intro-description" className="mt-3 min-h-[4.65rem] text-lg leading-snug text-muted" aria-live="polite">
              <span aria-hidden="true">{typedMessage.text}</span>
              {!typedMessage.complete && <span className="typing-cursor" aria-hidden="true">|</span>}
              <span className="sr-only">{message}</span>
            </p>
            <div className={typedMessage.complete ? 'modal-action-reveal' : 'modal-action-placeholder'}>
              <PrimaryButton className="mx-auto mt-6" onClick={handleDismiss} disabled={!typedMessage.complete || closing}>
                {buttonLabel}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GameIntroModal
