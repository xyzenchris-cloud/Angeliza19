import { motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import { HER_NAME } from '../data/config'
import { initializeAudioContext, playIntro, prepareSfxFile } from '../lib/sfx'
import PrimaryButton from './PrimaryButton'
import GifImage from './GifImage'
import { gifAssets } from '../data/gifAssets'
import { useTypewriter } from '../hooks/useTypewriter'

const LANDING_MESSAGE = 'Sana magustuhan mo tong munting effort ko for you.'
const LANDING_SIGNATURE = '— Chris Xyzen'
const VOLUME_HINT = 'Turn on full volume for maximum experience'

type CoverScreenProps = {
  onContinue: () => void
  assetsReady: boolean
}

function CoverScreen({ onContinue, assetsReady }: CoverScreenProps) {
  const [landingStarted, setLandingStarted] = useState(false)
  const volumeHint = useTypewriter(VOLUME_HINT, 35, assetsReady && !landingStarted)
  const landingTyping = useTypewriter(
    `${LANDING_MESSAGE}\n${LANDING_SIGNATURE}`,
    75,
    landingStarted,
  )
  const messageText = landingTyping.text.slice(0, LANDING_MESSAGE.length)
  const signatureStart = LANDING_MESSAGE.length + 1
  const signatureText = landingTyping.text.slice(signatureStart)

  const beginLandingSequence = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.style.display = 'none'
    setLandingStarted(true)
    initializeAudioContext()
    prepareSfxFile('intro.wav')
    void playIntro()
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-20 flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-cream text-lg font-semibold text-heart-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30"
        onClick={beginLandingSequence}
      >
        <motion.span
          animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.03, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Tap to begin
        </motion.span>
        <span className="min-h-[1.25rem] text-sm font-medium text-muted">
          {volumeHint.text}
          {!volumeHint.complete && <span className="typing-cursor" aria-hidden="true">|</span>}
        </span>
      </button>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-center">
        <h1 className={`${landingStarted ? 'seq-1' : 'landing-seq'} font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl`}>
          Happy Birthday, {HER_NAME}!
        </h1>

        <GifImage
          src={gifAssets.landing}
          alt="Bubu and Dudu celebrating"
          className={`${landingStarted ? 'seq-2' : 'landing-seq'} mt-4 h-40 w-auto max-w-full object-contain`}
          loading="eager"
          draggable={false}
        />

        <p className={`${landingStarted ? 'seq-3' : 'landing-seq'} mx-auto mt-4 min-h-[88px] max-w-xs text-lg text-muted`}>
          <span aria-hidden="true">{messageText}</span>
          <span className="mt-1 block" aria-hidden="true">{signatureText}</span>
          {!landingTyping.complete && landingStarted && <span className="typing-cursor" aria-hidden="true">|</span>}
          <span className="sr-only">
            {LANDING_MESSAGE}
            {` ${LANDING_SIGNATURE}`}
          </span>
        </p>

        <div className={landingTyping.complete ? 'seq-4' : 'landing-action-placeholder'}>
          <PrimaryButton className="mx-auto mt-7" onClick={onContinue} disabled={!landingTyping.complete}>
            Let&apos;s go »
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}

export default CoverScreen
