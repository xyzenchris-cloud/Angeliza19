import { AnimatePresence, motion } from 'framer-motion'
import { Lottie, type LottieHandle } from 'lottie-react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useMotionValue } from 'framer-motion'
import envelopeAnimation from '../assets/lottie/envelope.json'
import { envelopeMessages } from '../data/envelopeMessages'
import { playChime, playFlip, playPop, playXp } from '../lib/sfx'
import PrimaryButton from './PrimaryButton'
import VoiceMessageBubble from './VoiceMessageBubble'
import TwemojiText from './TwemojiText'

type EnvelopeHuntSceneProps = {
  introModalDismissed: boolean
}

type Accent = (typeof envelopeMessages)[number]['accentColor']
type Tile = { id: string; src: string; stackIndex: number; rotate: number }
type Slot = {
  id: string
  accentColor: Accent
  baseX: string
  baseY: string
  tiles: Tile[]
}

const photoUrls = Object.values(
  import.meta.glob('../images/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default', query: '?url' }),
) as string[]

const tileLayouts = [
  [
    { stackIndex: 0, rotate: -3 },
    { stackIndex: 1, rotate: 4 },
    { stackIndex: 2, rotate: -1 },
  ],
  [
    { stackIndex: 0, rotate: 2 },
    { stackIndex: 1, rotate: -5 },
    { stackIndex: 2, rotate: 3 },
    { stackIndex: 3, rotate: -2 },
  ],
  [
    { stackIndex: 0, rotate: -4 },
    { stackIndex: 1, rotate: 3 },
    { stackIndex: 2, rotate: 0 },
  ],
] as const

const baseSlots = [
  ['env-1', 'blush', '8%', '9%'],
  ['env-2', 'lavender', '42%', '36%'],
  ['env-3', 'gold', '12%', '66%'],
] as const

const shuffledPhotoUrls = [...photoUrls]
for (let index = shuffledPhotoUrls.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(Math.random() * (index + 1))
  ;[shuffledPhotoUrls[index], shuffledPhotoUrls[swapIndex]] = [
    shuffledPhotoUrls[swapIndex],
    shuffledPhotoUrls[index],
  ]
}
let assignedTileCount = 0

const slots: Slot[] = baseSlots.map(([id, accentColor, baseX, baseY], index) => ({
  id,
  accentColor,
  baseX,
  baseY,
  tiles: tileLayouts[index].map((layout, tileIndex) => {
    const source = shuffledPhotoUrls[assignedTileCount]
      ?? shuffledPhotoUrls[Math.floor(Math.random() * Math.max(shuffledPhotoUrls.length, 1))]
      ?? ''
    assignedTileCount += 1
    return {
      id: `${id}-tile-${tileIndex}`,
      src: source,
      ...layout,
    }
  }),
}))

type ClutterTileProps = {
  tile: Tile
  cleared: boolean
  enabled: boolean
  envelopeRef: RefObject<HTMLButtonElement | null>
  settledPosition?: { x: number; y: number }
  onClear: (tileId: string, position: { x: number; y: number }) => void
}

type EnvelopeTileProps = {
  state: 'hidden' | 'revealed' | 'opened'
  enabled: boolean
  settledPosition?: { x: number; y: number }
  onOpen: (element: HTMLButtonElement) => void
  onMove: (position: { x: number; y: number }) => void
  buttonRef: RefObject<HTMLButtonElement | null>
}

function LottieEnvelope({ state, className = '', lottieRef, onComplete, onReady }: {
  state: EnvelopeTileProps['state']
  className?: string
  lottieRef?: RefObject<LottieHandle | null>
  onComplete?: () => void
  onReady?: () => void
}) {
  const internalRef = useRef<LottieHandle>(null)
  const animationRef = lottieRef ?? internalRef
  const finalFrame = Math.max(0, envelopeAnimation.op - 1)

  const seekToStateFrame = () => {
    const instance = animationRef.current
    if (!instance) return
    instance.pause()
    instance.seek(state === 'opened' ? finalFrame : 0)
  }

  useEffect(seekToStateFrame, [animationRef, finalFrame, state])

  return (
    <Lottie
      lottieRef={animationRef}
      src={envelopeAnimation}
      autoplay={false}
      loop={false}
      subscriptions={{
        ready: () => {
          seekToStateFrame()
          onReady?.()
        },
        ...(onComplete ? { complete: onComplete } : {}),
      }}
      className={className}
    />
  )
}

function EnvelopeTile({ state, enabled, settledPosition, onOpen, onMove, buttonRef }: EnvelopeTileProps) {
  const x = useMotionValue(settledPosition?.x ?? 0)
  const y = useMotionValue(settledPosition?.y ?? 0)
  const isDraggable = enabled && state === 'opened'

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label={state === 'opened' ? 'Read this envelope again' : 'Open envelope'}
      className="absolute z-[15] cursor-pointer touch-manipulation rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        x,
        y,
        pointerEvents: enabled && state !== 'hidden' ? 'auto' : 'none',
        touchAction: isDraggable ? 'none' : 'manipulation',
      }}
      drag={isDraggable}
      dragMomentum
      dragTransition={{ bounceStiffness: 300, bounceDamping: 24 }}
      whileDrag={{ scale: 1.06, zIndex: 60 }}
      onDragEnd={(_event, info) => {
        if (isDraggable && Math.hypot(info.offset.x, info.offset.y) >= 10) {
          onMove({ x: info.offset.x, y: info.offset.y })
        }
      }}
          onTap={() => {
            if (state !== 'hidden' && buttonRef.current) onOpen(buttonRef.current)
      }}
    >
      <LottieEnvelope state={state} className="block h-20 w-24" />
    </motion.button>
  )
}

type EnvelopePileProps = {
  slot: Slot
  revealed: boolean
  opened: boolean
  introModalDismissed: boolean
  clearedTiles: string[]
  settledPositions: Record<string, { x: number; y: number }>
  onClearTile: (tileId: string, position: { x: number; y: number }) => void
  onOpen: (id: string, element: HTMLButtonElement) => void
  onMoveEnvelope: (id: string, position: { x: number; y: number }) => void
}

function EnvelopePile({
  slot,
  revealed,
  opened,
  introModalDismissed,
  clearedTiles,
  settledPositions,
  onClearTile,
  onOpen,
  onMoveEnvelope,
}: EnvelopePileProps) {
  const envelopeRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      className="absolute h-0 w-0"
      style={{ position: 'absolute', left: slot.baseX, top: slot.baseY }}
      data-pile-id={slot.id}
    >
      <EnvelopeTile
        state={opened ? 'opened' : revealed ? 'revealed' : 'hidden'}
        enabled={introModalDismissed}
        settledPosition={settledPositions[`${slot.id}-envelope`]}
        buttonRef={envelopeRef}
        onOpen={(element) => onOpen(slot.id, element)}
        onMove={(position) => onMoveEnvelope(slot.id, position)}
      />
      {slot.tiles.map((tile) => (
        <ClutterTile
          key={tile.id}
          tile={tile}
          cleared={clearedTiles.includes(tile.id)}
          enabled={introModalDismissed}
          envelopeRef={envelopeRef}
          settledPosition={settledPositions[tile.id]}
          onClear={onClearTile}
        />
      ))}
    </div>
  )
}

function ClutterTile({ tile, cleared, enabled, envelopeRef, settledPosition, onClear }: ClutterTileProps) {
  const x = useMotionValue(settledPosition?.x ?? 0)
  const y = useMotionValue(settledPosition?.y ?? 0)
  const tileRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={tileRef}
      data-clutter-tile={tile.id}
      className="absolute inline-flex cursor-grab touch-none border-[4px] border-white bg-white p-0.5 shadow-lg active:cursor-grabbing"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        x,
        y,
        zIndex: cleared ? 10 : 20 + tile.stackIndex,
        rotate: tile.rotate,
        transformOrigin: 'center',
        pointerEvents: enabled && !cleared ? 'auto' : 'none',
        touchAction: 'none',
      }}
      drag={enabled && !cleared}
      dragMomentum
      dragTransition={{ bounceStiffness: 300, bounceDamping: 24 }}
      whileDrag={{ scale: 1.08, zIndex: 50 }}
      onDragStart={() => {
        void playFlip()
      }}
      onDragEnd={() => {
        if (cleared) return

        let framesRemaining = 20
        let resolved = false
        const checkSettledPosition = () => {
          if (resolved) return
          const tileBounds = tileRef.current?.getBoundingClientRect()
          const envelopeBounds = envelopeRef.current?.getBoundingClientRect()
          const overlapTolerance = 3
          const overlapsEnvelope =
            tileBounds &&
            envelopeBounds &&
            tileBounds.left < envelopeBounds.right - overlapTolerance &&
            tileBounds.right > envelopeBounds.left + overlapTolerance &&
            tileBounds.top < envelopeBounds.bottom - overlapTolerance &&
            tileBounds.bottom > envelopeBounds.top + overlapTolerance

          if (!overlapsEnvelope && tileBounds && envelopeBounds) {
            resolved = true
            onClear(tile.id, { x: x.get(), y: y.get() })
            return
          }

          framesRemaining -= 1
          if (framesRemaining > 0) {
            window.requestAnimationFrame(checkSettledPosition)
          }
        }

        window.requestAnimationFrame(checkSettledPosition)
      }}
    >
      <img
        src={tile.src}
        alt=""
        className="block h-[120px] w-auto max-w-none object-contain"
        draggable={false}
      />
    </motion.div>
  )
}

function EnvelopeHuntScene({ introModalDismissed }: EnvelopeHuntSceneProps) {
  const [clearedTiles, setClearedTiles] = useState<string[]>([])
  const [opened, setOpened] = useState<string[]>([])
  const [activeMessage, setActiveMessage] = useState<string | null>(null)
  const [messageStage, setMessageStage] = useState<'read' | 'voice' | 'complete'>('read')
  const [settledPositions, setSettledPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [centeredMessageId, setCenteredMessageId] = useState<string | null>(null)
  const [openingOrigin, setOpeningOrigin] = useState({ left: 0, top: 0 })
  const [backdropVisible, setBackdropVisible] = useState(false)
  const [openingLottieReady, setOpeningLottieReady] = useState(false)
  const openingLottieRef = useRef<LottieHandle>(null)
  const openingStartedRef = useRef(false)

  const revealed = useMemo(
    () => slots.filter((slot) => slot.tiles.every((tile) => clearedTiles.includes(tile.id))).map((slot) => slot.id),
    [clearedTiles],
  )

  const clearTile = (tileId: string, offset: { x: number; y: number }) => {
    if (!introModalDismissed || clearedTiles.includes(tileId)) return
    setClearedTiles((current) => [...current, tileId])
    setSettledPositions((current) => ({ ...current, [tileId]: offset }))
    playPop()
  }

  const openEnvelope = (id: string, element: HTMLButtonElement) => {
    if (!revealed.includes(id)) return
    if (opened.includes(id)) {
      setMessageStage('read')
      setActiveMessage(id)
      return
    }
    const rect = element.getBoundingClientRect()
    setOpeningOrigin({ left: rect.left, top: rect.top })
    setOpeningId(id)
    setOpeningLottieReady(false)
    openingStartedRef.current = false
    setBackdropVisible(false)
    openingLottieRef.current?.seek(0)
  }

  useEffect(() => {
    if (!openingId || !backdropVisible || !openingLottieReady || openingStartedRef.current) return
    const lottie = openingLottieRef.current
    if (!lottie) return

    openingStartedRef.current = true
    lottie.setSpeed(1.7)
    void playXp()
    lottie.play()
  }, [backdropVisible, openingId, openingLottieReady])

  const complete = opened.length === envelopeMessages.length
  const message = envelopeMessages.find((item) => item.id === activeMessage)

  return (
    <div className="w-full text-center">
      <>
          <h2 className="font-display text-xl font-extrabold text-heart-strong">Find Bubu&apos;s missing envelopes</h2>
          <p className="mt-1 text-sm font-semibold text-muted">Clear every photo pile to reveal each message.</p>
          <div className="relative mx-auto mt-5 h-[35rem] w-full max-w-lg">
            {slots.map((slot) => (
              <EnvelopePile
                key={slot.id}
                slot={slot}
                revealed={revealed.includes(slot.id)}
                opened={opened.includes(slot.id)}
                introModalDismissed={introModalDismissed}
                clearedTiles={clearedTiles}
                settledPositions={settledPositions}
                onClearTile={clearTile}
                onOpen={openEnvelope}
                onMoveEnvelope={(id, position) =>
                  setSettledPositions((current) => ({
                    ...current,
                    [`${id}-envelope`]: position,
                  }))
                }
              />
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-heart-strong">{opened.length} / 3 opened</p>
      </>
      {complete && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
          <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 0.8, repeat: 2 }}>
            <LottieEnvelope state="opened" className="mx-auto h-20 w-24" />
          </motion.div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-heart-strong">You found them all 💛</h2>
        </motion.div>
      )}

      <AnimatePresence>
        {openingId && (
          <>
            {backdropVisible && (
              <motion.div
                className="fixed inset-0 z-[80] bg-black/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            )}
            <motion.div
              className="fixed z-[90] h-24 w-28"
              initial={{ left: openingOrigin.left, top: openingOrigin.top, x: 0, y: 0, scale: 1 }}
              animate={{ left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 1.5 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onAnimationComplete={() => {
                setBackdropVisible(true)
              }}
            >
              <LottieEnvelope
                state="revealed"
                className="h-full w-full"
                lottieRef={openingLottieRef}
                onReady={() => setOpeningLottieReady(true)}
                onComplete={() => {
                  if (!openingId) return
                  void playFlip()
                  setOpened((current) => [...current, openingId])
                  setMessageStage('read')
                  setActiveMessage(openingId)
                  setCenteredMessageId(openingId)
                  setOpeningId(null)
                  playChime()
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div className="modal-backdrop z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card z-[110] max-h-[85vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="envelope-message-title" initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <LottieEnvelope state="opened" className="mx-auto h-16 w-20" />
              <h2 id="envelope-message-title" className="mt-2 font-display text-2xl font-extrabold text-heart-strong">A message for you</h2>
              <TwemojiText className="mt-4 block whitespace-pre-line text-left text-lg leading-relaxed text-ink">
                {message.text}
              </TwemojiText>
              <div className="mt-5 flex min-h-12 items-center justify-center">
                <motion.div
                  className={messageStage === 'read' ? 'opacity-100' : 'pointer-events-none opacity-0'}
                  animate={{ opacity: messageStage === 'read' ? 1 : 0, y: messageStage === 'read' ? 0 : -6, scale: messageStage === 'read' ? 1 : 0.96 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <PrimaryButton
                    onClick={(event) => {
                      event.stopPropagation()
                      setMessageStage('voice')
                    }}
                  >
                    <TwemojiText>I've read this 💌</TwemojiText>
                  </PrimaryButton>
                </motion.div>
              </div>
              <div className="flex min-h-[5.5rem] items-center justify-center">
                {messageStage !== 'read' && (
                  <VoiceMessageBubble
                    audioSrc={message.voiceNote ?? `/voiceover/VO${message.id.replace('env-', '')}.mp3`}
                    voiceTooltip={message.voiceTooltip}
                    onEntranceComplete={() => setMessageStage((stage) => (stage === 'voice' ? 'complete' : stage))}
                  />
                )}
              </div>
              <div className="mt-1 flex min-h-12 items-center justify-center">
                <motion.div
                  className={messageStage === 'complete' ? 'pointer-events-auto' : 'pointer-events-none'}
                  initial={false}
                  animate={{ opacity: messageStage === 'complete' ? 1 : 0, y: messageStage === 'complete' ? 0 : 8, scale: messageStage === 'complete' ? 1 : 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <PrimaryButton
                    onClick={(event) => {
                      event.stopPropagation()
                      if (centeredMessageId === activeMessage) {
                        setReturningId(activeMessage)
                        setBackdropVisible(true)
                      } else {
                        setCenteredMessageId(null)
                      }
                      setActiveMessage(null)
                    }}
                  >
                    Back to hunt »
                  </PrimaryButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {returningId && (
          <>
            {backdropVisible && (
              <motion.div
                className="fixed inset-0 z-[80] bg-black/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            <motion.div
              className="fixed z-[90] h-24 w-28"
              initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 1.5 }}
              animate={{ left: openingOrigin.left, top: openingOrigin.top, x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onAnimationComplete={() => {
                setReturningId(null)
                setCenteredMessageId(null)
                setBackdropVisible(false)
              }}
            >
              <LottieEnvelope state="opened" className="h-full w-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnvelopeHuntScene
