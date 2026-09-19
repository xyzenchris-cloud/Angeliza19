let audioContext: AudioContext | null = null
const bundledSfx = import.meta.glob('../assets/newSfx/*', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const warnedSfx = new Set<string>()
const preparedSfx = new Map<string, HTMLAudioElement>()
const activeSfx = new Map<string, HTMLAudioElement>()
let typingStopTimer: number | null = null
let typingTickStopTimer: number | null = null
const screenAudioNames = ['intro.wav', 'beating.wav', 'happy.wav', 'Crying.wav']

export function initializeAudioContext() {
  if (audioContext) {
    if (audioContext.state === 'suspended') void audioContext.resume()
    return audioContext
  }
  const AudioContextConstructor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) return null
  audioContext = new AudioContextConstructor()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

export function unlockAudio() {
  const context = audioContext
  if (!context || context.state === 'running') return Promise.resolve()
  return context.resume().catch(() => undefined)
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  startOffset = 0,
  volume = 0.045,
) {
  const context = audioContext
  if (!context) return
  const start = context.currentTime + startOffset
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playTap() {
  tone(520, 0.1, 'sine', 0, 0.035)
}

export async function playClick() {
  await unlockAudio()
  tone(760, 0.055, 'sine', 0, 0.018)
}

export async function playCrunch() {
  await playSfxFile('crunch.wav')
}

export async function playBadCatch() {
  await playSfxFile('error.wav')
}

export function playSuccess() {
  tone(660, 0.16, 'triangle', 0, 0.04)
  tone(880, 0.2, 'triangle', 0.1, 0.04)
}

export function playError() {
  tone(240, 0.16, 'sine', 0, 0.03)
  tone(190, 0.18, 'sine', 0.1, 0.025)
}

export function playPop() {
  tone(720, 0.12, 'triangle', 0, 0.04)
}

export function playTyping(volume = 0.8, durationMs = 6000) {
  if (typingStopTimer !== null) {
    window.clearTimeout(typingStopTimer)
    typingStopTimer = null
  }
  void playSfxFile('typing.wav', volume)
  typingStopTimer = window.setTimeout(() => {
    stopSfxFile('typing.wav')
    typingStopTimer = null
  }, durationMs)
}

export async function playTypingTick(volume = 0.8) {
  if (typingTickStopTimer !== null) {
    window.clearTimeout(typingTickStopTimer)
    typingTickStopTimer = null
  }
  const started = await playSfxFile('typing.wav', volume)
  if (started) {
    typingTickStopTimer = window.setTimeout(() => {
      stopSfxFile('typing.wav')
      typingTickStopTimer = null
    }, 120)
  }
}

export function playChime() {
  tone(523.25, 0.2, 'sine', 0, 0.035)
  tone(659.25, 0.24, 'sine', 0.14, 0.035)
  tone(783.99, 0.3, 'sine', 0.28, 0.03)
}

export async function playBeat() {
  await playSfxFile('beating.wav')
}

export async function playFlip() {
  await playSfxFile('flip.wav')
}

export async function playXp() {
  await playSfxFile('xp.wav')
}

export function playIntro() {
  return playSfxFile('intro.wav')
}

function resolveSfx(name: string) {
  const key = `../assets/newSfx/${name}`
  const url = bundledSfx[key]
  if (!url && !warnedSfx.has(name)) {
    warnedSfx.add(name)
    console.warn(`[sfx] Missing audio asset: src/assets/newSfx/${name}`)
  }
  return url
}

export function prepareSfxFile(name: string) {
  const url = resolveSfx(name)
  if (!url || preparedSfx.has(name)) return
  const audio = new Audio(url)
  audio.preload = 'auto'
  audio.muted = true
  preparedSfx.set(name, audio)
  audio.load()
}

export function playSfxFile(name: string, volume = 1) {
  return new Promise<boolean>((resolve) => {
    const url = resolveSfx(name)
    if (!url) {
      resolve(false)
      return
    }
    const previousAudio = activeSfx.get(name)
    if (previousAudio) {
      previousAudio.pause()
      previousAudio.currentTime = 0
      activeSfx.delete(name)
    }
    const audio = preparedSfx.get(name) ?? new Audio(url)
    activeSfx.set(name, audio)
    audio.muted = false
    audio.volume = Math.max(0, Math.min(1, volume))
    audio.currentTime = 0
    let settled = false
    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    audio.addEventListener('ended', () => settle(true), { once: true })
    audio.addEventListener('error', () => {
      if (!warnedSfx.has(name)) {
        warnedSfx.add(name)
        console.warn(`[sfx] Audio failed to load or decode: src/assets/newSfx/${name}`)
      }
      settle(false)
    }, { once: true })
    void audio.play().then(() => settle(true)).catch(() => {
      if (!warnedSfx.has(name)) {
        warnedSfx.add(name)
        console.warn(`[sfx] Audio playback was rejected: src/assets/newSfx/${name}`)
      }
      settle(false)
    })
  })
}

export function stopScreenAudio() {
  for (const name of screenAudioNames) {
    stopSfxFile(name)
  }
}

export function stopSfxFile(name: string) {
  const audio = activeSfx.get(name) ?? preparedSfx.get(name)
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
  activeSfx.delete(name)
}
