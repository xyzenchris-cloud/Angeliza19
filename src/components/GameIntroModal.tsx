import PrimaryButton from './PrimaryButton'
import { useEffect, useRef, useState } from 'react'
import GifImage from './GifImage'
import { playSfxFile, playTyping, stopSfxFile } from '../lib/sfx'

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
  const [typedMessage, setTypedMessage] = useState(open ? message : '')
  const [typingComplete, setTypingComplete] = useState(false)
  const closeTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const soundTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const typingTimer = useRef<ReturnType<typeof window.setInterval> | null>(null)
  const typingAudioKey = useRef<string | null>(null)

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
    if (typingTimer.current !== null) {
      window.clearInterval(typingTimer.current)
      typingTimer.current = null
    }

    if (!open) {
      setTypedMessage('')
      setTypingComplete(false)
      typingAudioKey.current = null
      return
    }

    let characterIndex = 0
    setTypedMessage('')
    setTypingComplete(false)
    if (typingAudioKey.current !== message) {
      typingAudioKey.current = message
      playTyping()
    }
    typingTimer.current = window.setInterval(() => {
      characterIndex += 1
      setTypedMessage(message.slice(0, characterIndex))

      if (characterIndex >= message.length && typingTimer.current !== null) {
        window.clearInterval(typingTimer.current)
        typingTimer.current = null
        setTypingComplete(true)
      }
    }, 64)

    return () => {
      if (typingTimer.current !== null) {
        window.clearInterval(typingTimer.current)
        typingTimer.current = null
      }
    }
  }, [message, open])

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current)
      }
      if (soundTimer.current !== null) {
        window.clearTimeout(soundTimer.current)
      }
      if (typingTimer.current !== null) {
        window.clearInterval(typingTimer.current)
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
              <span aria-hidden="true">{typedMessage}</span>
              <span className="sr-only">{message}</span>
            </p>
            <div className={typingComplete ? 'modal-action-reveal' : 'modal-action-placeholder'}>
              <PrimaryButton className="mx-auto mt-6" onClick={handleDismiss} disabled={!typingComplete || closing}>
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
