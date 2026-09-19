import { allGifAssets } from '../data/gifAssets'
import pawImage from '../assets/ui/paw.png'
import { initializeAudioContext, preloadTypingSound } from './sfx'

const clutterImageUrls = Object.values(
  import.meta.glob('../images/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default', query: '?url' }),
) as string[]
const audioUrls = import.meta.glob('../assets/newSfx/*.{wav,mp3,ogg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const voiceoverUrls = import.meta.glob('../assets/voiceover/*.{mp3,wav,ogg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const lottieUrl = new URL('../assets/lottie/envelope.json', import.meta.url).href
let allAssetsPromise: Promise<void> | null = null

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = url
  })
}

function preloadAudio(url: string) {
  return new Promise<void>((resolve) => {
    const audio = new Audio(url)
    const finish = () => {
      audio.removeEventListener('canplaythrough', finish)
      audio.removeEventListener('loadeddata', finish)
      audio.removeEventListener('error', finish)
      resolve()
    }
    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', finish, { once: true })
    audio.addEventListener('loadeddata', finish, { once: true })
    audio.addEventListener('error', finish, { once: true })
    audio.load()
  })
}

async function preloadLottie() {
  try {
    const response = await fetch(lottieUrl)
    await response.json()
  } catch {
    // The startup timeout prevents an unavailable optional asset from blocking the app.
  }
}

export function preloadGif(url: string) {
  return preloadImage(url)
}

export function preloadAllGifs() {
  void Promise.allSettled(allGifAssets.map(preloadGif))
}

export function preloadAllAssets() {
  if (allAssetsPromise) return allAssetsPromise

  const audioAssetUrls = Object.values(audioUrls)
  const context = initializeAudioContext()
  allAssetsPromise = Promise.allSettled([
    ...allGifAssets.map(preloadImage),
    ...clutterImageUrls.map(preloadImage),
    ...audioAssetUrls.map(preloadAudio),
    ...Object.values(voiceoverUrls).map(preloadAudio),
    preloadImage(pawImage),
    preloadLottie(),
    context ? preloadTypingSound(context) : Promise.resolve(),
  ]).then(() => undefined)

  return allAssetsPromise
}
