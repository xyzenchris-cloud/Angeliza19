import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { bearAssets } from '../data/bearAssets'
import GifImage from './GifImage'
import TwemojiText from './TwemojiText'

const BAR_COUNT = 18

type VoiceMessageBubbleProps = {
  audioSrc: string
  voiceTooltip?: string
  onEntranceComplete?: () => void
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

const voiceoverAssets = import.meta.glob('../assets/voiceover/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function resolveAudioSrc(audioSrc: string) {
  if (!audioSrc.startsWith('/voiceover/')) return audioSrc
  return voiceoverAssets[`../assets${audioSrc}`] ?? audioSrc
}

function VoiceMessageBubble({ audioSrc, voiceTooltip, onEntranceComplete }: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [available, setAvailable] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimer = useRef<number | null>(null)
  const resolvedAudioSrc = resolveAudioSrc(audioSrc)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const resetPlayback = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('ended', resetPlayback)
    audio.addEventListener('error', () => setAvailable(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('ended', resetPlayback)
      if (tooltipTimer.current !== null) window.clearTimeout(tooltipTimer.current)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || !available) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    if (voiceTooltip) {
      setShowTooltip(true)
      if (tooltipTimer.current !== null) window.clearTimeout(tooltipTimer.current)
      tooltipTimer.current = window.setTimeout(() => {
        setShowTooltip(false)
        tooltipTimer.current = null
      }, 3600)
    }

    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setAvailable(false)
      setPlaying(false)
    }
  }

  return (
    <motion.div
      className="mx-auto mt-5 flex w-fit max-w-full flex-col items-center"
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
      onAnimationComplete={onEntranceComplete}
    >
      <p className="mb-2 text-xs font-semibold text-muted">A little something from me</p>
      <div className="relative">
        <AnimatePresence>
          {showTooltip && voiceTooltip && (
            <motion.div
              className="absolute bottom-full left-0 z-10 mb-2 max-w-[16rem] rounded-2xl bg-heart px-3 py-2 text-left text-xs font-semibold text-white shadow-lg"
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
            >
              <TwemojiText>{voiceTooltip}</TwemojiText>
            </motion.div>
          )}
        </AnimatePresence>
      <div
        className={`flex items-center gap-2 rounded-full border-2 border-blush bg-cream px-3 py-2 shadow-lg shadow-bubu/10 ${
          available ? '' : 'opacity-60'
        }`}
      >
        <button
          type="button"
          aria-label={playing ? 'Pause voice message' : 'Play voice message'}
          aria-disabled={!available}
          disabled={!available}
          onClick={() => void togglePlayback()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-heart text-white shadow-md transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30 active:scale-95 disabled:cursor-not-allowed"
        >
          {playing ? (
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-4 w-1.5 rounded-full bg-white" />
              <span className="h-4 w-1.5 rounded-full bg-white" />
            </span>
          ) : (
            <span
              className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-white"
              aria-hidden="true"
            />
          )}
        </button>
        <div className="flex h-8 items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: BAR_COUNT }, (_, index) => (
            <span
              key={index}
              className={`voice-wave-bar ${playing ? 'voice-wave-bar-playing' : ''}`}
              style={{ '--wave-delay': `${index * 45}ms`, '--wave-height': `${8 + ((index * 7) % 12)}px` } as CSSProperties}
            />
          ))}
        </div>
        <span className="min-w-[4.8rem] text-right text-xs font-bold tabular-nums text-bubu">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <GifImage
          src={bearAssets.dudu.idle}
          alt="Dudu holding a voice message"
          className="h-9 w-9 rounded-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
      </div>
      <audio ref={audioRef} preload="metadata" src={resolvedAudioSrc} />
      {!available && <span className="mt-1 text-[10px] font-semibold text-muted">Voice note coming soon</span>}
    </motion.div>
  )
}

export default VoiceMessageBubble
