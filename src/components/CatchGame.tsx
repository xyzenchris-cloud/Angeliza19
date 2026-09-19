import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Bear from './Bear'
import { playBadCatch, playCrunch, playPop, playSfxFile, unlockAudio } from '../lib/sfx'
import { Heart, Sparkles } from 'lucide-react'
import { bearAssets } from '../data/bearAssets'
import friedChickenImage from '../assets/game/fried-chicken.png'
import saladImage from '../assets/game/salad.png'
import ImpactBurst from './effects/ImpactBurst'
import { gifAssets } from '../data/gifAssets'
import ResultScreen from './ResultScreen'

type GameStatus = 'playing' | 'won' | 'lost'
type FallingItem = { id: number; x: number; y: number; speed: number; badItem: boolean }
type Particle = { id: number; x: number; y: number }
type Crumb = { id: number; x: number; y: number; offsetX: number; offsetY: number; rotation: number }
type Impact = { id: number; x: number; y: number }

const MAX_ITEMS = 15
const MAX_PARTICLES = 8
const PARTICLE_LIFETIME = 600
const CRUNCH_LIFETIME = 130
const IMPACT_CATCH_LIFETIME = 180
const CRUMB_LIFETIME = 600
const STARTING_LIVES = 3
const BASE_BAD_ITEM_CHANCE = 0.3
const MAX_BAD_ITEM_CHANCE = 0.4

type CatchGameProps = {
  onContinue: () => void
  introModalDismissed?: boolean
}

function CatchGame({ onContinue, introModalDismissed = true }: CatchGameProps) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(STARTING_LIVES)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [items, setItems] = useState<FallingItem[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [crunchItems, setCrunchItems] = useState<FallingItem[]>([])
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  const [impactBursts, setImpactBursts] = useState<Impact[]>([])
  const [isCatching, setIsCatching] = useState(false)
  const [isBadCatching, setIsBadCatching] = useState(false)
  const [lostHeartIndex, setLostHeartIndex] = useState<number | null>(null)
  const [showGetReady, setShowGetReady] = useState(false)
  const [gameReady, setGameReady] = useState(false)
  const scoreRef = useRef(0)
  const livesRef = useRef(STARTING_LIVES)
  const areaRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const targetX = useRef(0)
  const playerX = useRef(0)
  const pointerActive = useRef(false)
  const itemsRef = useRef<FallingItem[]>([])
  const itemElements = useRef(new Map<number, HTMLDivElement>())
  const nextId = useRef(0)
  const animationFrame = useRef<number | null>(null)
  const spawnTimer = useRef<number | null>(null)
  const catchTimer = useRef<number | null>(null)
  const badCatchTimer = useRef<number | null>(null)
  const roundToken = useRef(0)
  const particleTimers = useRef(new Set<number>())
  const crunchTimers = useRef(new Set<number>())

  const resetGame = () => {
    roundToken.current += 1
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
    if (spawnTimer.current !== null) window.clearInterval(spawnTimer.current)
    if (catchTimer.current !== null) window.clearTimeout(catchTimer.current)
    if (badCatchTimer.current !== null) window.clearTimeout(badCatchTimer.current)
    animationFrame.current = null
    spawnTimer.current = null
    catchTimer.current = null
    pointerActive.current = false
    const areaBounds = areaRef.current?.getBoundingClientRect()
    const centerX = areaBounds ? areaRef.current!.clientWidth / 2 : 0
    targetX.current = centerX
    playerX.current = centerX
    if (playerRef.current) {
      playerRef.current.style.left = '0'
      playerRef.current.style.transform = `translate3d(${centerX}px, 0, 0) translateX(-50%)`
    }
    particleTimers.current.forEach((timer) => window.clearTimeout(timer))
    particleTimers.current.clear()
    crunchTimers.current.forEach((timer) => window.clearTimeout(timer))
    crunchTimers.current.clear()
    itemsRef.current = []
    itemElements.current.clear()
    setItems([])
    setParticles([])
    setCrunchItems([])
    setCrumbs([])
    setImpactBursts([])
    setScore(0)
    setLives(STARTING_LIVES)
    setLostHeartIndex(null)
    setIsCatching(false)
    setIsBadCatching(false)
    scoreRef.current = 0
    livesRef.current = STARTING_LIVES
    nextId.current = 0
    setGameStatus('playing')
  }

  const continueToQuiz = () => {
    if (gameStatus !== 'won') return
    onContinue()
  }

  const retryGame = () => {
    if (gameStatus === 'lost') resetGame()
  }

  useEffect(() => {
    if (!introModalDismissed) {
      setGameReady(false)
      return
    }
    if (gameReady) return

    setShowGetReady(true)
    const getReadyTimer = window.setTimeout(() => {
      setShowGetReady(false)
      setGameReady(true)
    }, 1800)

    return () => window.clearTimeout(getReadyTimer)
  }, [introModalDismissed, gameReady])

  useEffect(() => {
    if (gameStatus === 'won') {
      void playSfxFile('happy.wav', 0.3)
    } else if (gameStatus === 'lost') {
      void playSfxFile('Crying.wav')
    }
  }, [gameStatus])

  const updateTarget = (clientX: number) => {
    const area = areaRef.current
    const player = playerRef.current
    if (!area || !player) return
    const bounds = area.getBoundingClientRect()
    const playerWidth = player.getBoundingClientRect().width
    const contentLeft = bounds.left + area.clientLeft
    const contentWidth = area.clientWidth
    const minX = playerWidth / 2
    const maxX = contentWidth - playerWidth / 2
    targetX.current = Math.max(minX, Math.min(maxX, clientX - contentLeft))
  }

  useEffect(() => {
    if (gameStatus !== 'playing' || !gameReady) return
    const area = areaRef.current
    const player = playerRef.current
    if (!area || !player) return
    const activeRound = ++roundToken.current
    const activeParticleTimers = particleTimers.current
    const activeCrunchTimers = crunchTimers.current

    const spawn = () => {
      if (roundToken.current !== activeRound) return
      if (itemsRef.current.length >= MAX_ITEMS) return
      const badItemChance = Math.min(
        MAX_BAD_ITEM_CHANCE,
        BASE_BAD_ITEM_CHANCE + Math.floor(scoreRef.current / 4) * 0.05,
      )
      const item: FallingItem = {
        id: nextId.current++,
        x: 8 + Math.random() * 84,
        y: -8,
        speed: 1.5 + Math.random() * 2 + Math.floor(scoreRef.current / 4) * 0.12,
        badItem: Math.random() < badItemChance,
      }
      itemsRef.current = [...itemsRef.current, item]
      setItems(itemsRef.current)
    }

    const tick = () => {
      if (roundToken.current !== activeRound) return
      const height = area.clientHeight
      playerX.current = targetX.current
      const areaWidth = area.clientWidth
      const playerWidth = player.getBoundingClientRect().width
      const minX = playerWidth / 2
      const maxX = areaWidth - playerWidth / 2
      playerX.current = Math.max(minX, Math.min(maxX, playerX.current))
      player.style.left = '0'
      player.style.transform = `translate3d(${playerX.current}px, 0, 0) translateX(-50%)`

      const playerBounds = {
        left: playerX.current - playerWidth / 2,
        right: playerX.current + playerWidth / 2,
        top: height - 92,
        bottom: height - 18,
      }
      const previousItemCount = itemsRef.current.length
      const remaining: FallingItem[] = []
      let goodHit = false
      let goodHitCount = 0
      let badHit = false

      for (const item of itemsRef.current) {
        const nextItem = { ...item, y: item.y + item.speed }
        const itemX = (nextItem.x / 100) * area.clientWidth
        const collided =
          itemX > playerBounds.left &&
          itemX < playerBounds.right &&
          nextItem.y + 24 > playerBounds.top &&
          nextItem.y < playerBounds.bottom

        if (collided) {
          if (nextItem.badItem) badHit = true
          else {
            const feedbackX = (playerX.current / area.clientWidth) * 100
            const feedbackY = playerBounds.top + 18
            goodHit = true
            goodHitCount += 1
            const crunchItem = { ...nextItem, x: feedbackX, y: feedbackY }
            setCrunchItems((current) => [...current, crunchItem])
            const impact: Impact = { id: nextItem.id, x: feedbackX, y: feedbackY }
            setImpactBursts((current) => [...current.slice(-7), impact])
            const crunchTimer = window.setTimeout(() => {
              setCrunchItems((current) => current.filter((item) => item.id !== crunchItem.id))
              activeCrunchTimers.delete(crunchTimer)
            }, CRUNCH_LIFETIME)
            activeCrunchTimers.add(crunchTimer)
            const impactTimer = window.setTimeout(() => {
              setImpactBursts((current) => current.filter((burst) => burst.id !== impact.id))
              activeCrunchTimers.delete(impactTimer)
            }, IMPACT_CATCH_LIFETIME)
            activeCrunchTimers.add(impactTimer)
            const nextCrumbs = Array.from({ length: 5 }, (_, index) => ({
              id: nextItem.id * 10 + index,
              x: feedbackX,
              y: feedbackY,
              offsetX: Math.round(Math.random() * 30 - 15),
              offsetY: Math.round(Math.random() * 26 - 20),
              rotation: Math.round(Math.random() * 40 - 20),
            }))
            setCrumbs((current) => [...current.slice(-24), ...nextCrumbs])
            const crumbTimer = window.setTimeout(() => {
              setCrumbs((current) => current.filter((crumb) => !nextCrumbs.some((next) => next.id === crumb.id)))
              activeCrunchTimers.delete(crumbTimer)
            }, CRUMB_LIFETIME)
            activeCrunchTimers.add(crumbTimer)
            setParticles((current) => [
              ...current.slice(-(MAX_PARTICLES - 1)),
              { id: nextItem.id, x: nextItem.x, y: nextItem.y },
            ])
            const particleTimer = window.setTimeout(() => {
              setParticles((current) => current.filter((particle) => particle.id !== nextItem.id))
              particleTimers.current.delete(particleTimer)
            }, PARTICLE_LIFETIME)
            particleTimers.current.add(particleTimer)
          }
          continue
        }
        if (nextItem.y <= height + 30) remaining.push(nextItem)
      }

      itemsRef.current = remaining
      if (remaining.length !== previousItemCount) {
        setItems(remaining)
      }
      for (const item of remaining) {
        const element = itemElements.current.get(item.id)
        if (element) {
          element.style.transform = `translate3d(-50%, ${item.y}px, 0)`
        }
      }

      if (goodHit) {
        void playCrunch()
        playPop()
        scoreRef.current = Math.min(12, scoreRef.current + goodHitCount)
        setScore(scoreRef.current)
        if (scoreRef.current >= 12) setGameStatus('won')
        setIsCatching(true)
        if (catchTimer.current !== null) window.clearTimeout(catchTimer.current)
        catchTimer.current = window.setTimeout(() => setIsCatching(false), 300)
      }
      if (badHit) {
        void playBadCatch()
        setIsBadCatching(true)
        if (badCatchTimer.current !== null) window.clearTimeout(badCatchTimer.current)
        badCatchTimer.current = window.setTimeout(() => {
          setIsBadCatching(false)
          badCatchTimer.current = null
        }, 280)
        const lostIndex = livesRef.current - 1
        setLostHeartIndex(lostIndex)
        livesRef.current = Math.max(0, livesRef.current - 1)
        setLives(livesRef.current)
        if (livesRef.current <= 0) setGameStatus('lost')
      }
      if (roundToken.current === activeRound) {
        animationFrame.current = window.requestAnimationFrame(tick)
      }
    }

    spawn()
    const initialCenter = area.clientWidth / 2
    targetX.current = initialCenter
    playerX.current = initialCenter
    player.style.left = '0'
    player.style.transform = `translate3d(${initialCenter}px, 0, 0) translateX(-50%)`
    spawnTimer.current = window.setInterval(spawn, 700)
    animationFrame.current = window.requestAnimationFrame(tick)

    return () => {
      if (roundToken.current === activeRound) roundToken.current += 1
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
      if (spawnTimer.current !== null) window.clearInterval(spawnTimer.current)
      if (catchTimer.current !== null) window.clearTimeout(catchTimer.current)
      if (badCatchTimer.current !== null) window.clearTimeout(badCatchTimer.current)
      activeParticleTimers.forEach((timer) => window.clearTimeout(timer))
      activeParticleTimers.clear()
      activeCrunchTimers.forEach((timer) => window.clearTimeout(timer))
      activeCrunchTimers.clear()
      animationFrame.current = null
      spawnTimer.current = null
    }
  }, [gameStatus, gameReady])

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-bold text-heart-strong">Chicken caught: {score}/12</p>
        <p aria-label={`${lives} lives remaining`} className="text-xl tracking-wide">
          {Array.from({ length: STARTING_LIVES }, (_, index) => {
            const full = index < lives
            const losing = index === lostHeartIndex
            return (
              <motion.span
                key={index}
                className="inline-block"
                animate={losing ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1, rotate: 0 }}
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
      <div
        ref={areaRef}
        className="relative aspect-[3/4] w-full touch-none overflow-hidden rounded-[2rem] border-2 border-blush bg-white/45 shadow-inner"
        onPointerDown={(event) => {
          void unlockAudio()
          pointerActive.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          updateTarget(event.clientX)
        }}
        onPointerMove={(event) => {
          if (pointerActive.current) updateTarget(event.clientX)
        }}
        onPointerUp={(event) => {
          pointerActive.current = false
          event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => {
          pointerActive.current = false
        }}
      >
        {showGetReady && (
          <div className="get-ready-overlay">
            <div className="get-ready-text">Get ready... 3, 2, 1... Go!</div>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            ref={(element) => {
              if (element) itemElements.current.set(item.id, element)
              else itemElements.current.delete(item.id)
            }}
            className="pointer-events-none absolute left-0 top-0 text-3xl will-change-transform"
            style={{ left: `${item.x}%`, transform: `translate3d(-50%, ${item.y}px, 0)` }}
          >
            <img
              src={item.badItem ? saladImage : friedChickenImage}
              alt=""
              className="h-10 w-10 object-contain"
              draggable={false}
            />
          </div>
        ))}
        {crunchItems.map((item) => (
          <div
            key={`crunch-${item.id}`}
            className="catch-crunch-item pointer-events-none absolute left-0 top-0"
            style={{ left: `${item.x}%`, '--crunch-y': `${item.y}px` } as CSSProperties}
          >
            <img src={friedChickenImage} alt="" className="h-10 w-10 object-contain" draggable={false} />
          </div>
        ))}
        {impactBursts.map((impact) => (
          <div
            key={`impact-${impact.id}`}
            className="impact-burst impact-burst-catch pointer-events-none absolute z-10"
            style={{ left: `${impact.x}%`, top: impact.y }}
          >
            <ImpactBurst size={54} color="#FFD479" />
          </div>
        ))}
        {crumbs.map((crumb) => (
          <span
            key={crumb.id}
            className="catch-crumb pointer-events-none absolute left-0 top-0"
            style={{
              left: `${crumb.x}%`,
              top: crumb.y,
              '--crumb-x': `${crumb.offsetX}px`,
              '--crumb-y': `${crumb.offsetY}px`,
              '--crumb-rotation': `${crumb.rotation}deg`,
            } as CSSProperties}
          />
        ))}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="catch-particle pointer-events-none absolute text-xl text-heart"
            style={{ left: `${particle.x}%`, top: particle.y }}
          >
            <Sparkles aria-hidden="true" className="h-5 w-5" color="#A92F49" strokeWidth={1.6} />
          </div>
        ))}
        <div
          ref={playerRef}
          className="absolute bottom-2 w-24 min-w-24 shrink-0 will-change-transform"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className={isBadCatching ? 'catch-bad-feedback' : undefined}>
            <Bear
              character="dudu"
              pose={isCatching ? 'happy' : 'idle'}
              asset={isCatching ? bearAssets.dudu.happy : bearAssets.dudu.idle}
              eager
              size="large"
            />
          </div>
        </div>
        {gameStatus !== 'playing' && (
          <ResultScreen
            className="pointer-events-auto absolute inset-0 z-20"
            gif={gameStatus === 'won' ? gifAssets.catchWin : gifAssets.catchLose}
            gifAlt={gameStatus === 'won' ? 'Bubu and Dudu celebrating' : 'Bubu and Dudu feeling sad'}
            heading={
              gameStatus === 'won'
                ? 'You caught them all!'
                : "Angeliza, don't eat grass! (vegetables) Only McDo."
            }
            subtext={gameStatus === 'won' ? 'Officially more bochoc than ever!' : 'Only McDo, Angeliza!'}
            buttonLabel={gameStatus === 'won' ? 'Continue »' : 'Try again'}
            onAction={gameStatus === 'won' ? continueToQuiz : retryGame}
          />
        )}
      </div>
    </div>
  )
}

export default CatchGame
