import { Frown, Hand, Heart, PawPrint, Smile } from 'lucide-react'
import GifImage from './GifImage'

type BearProps = {
  character: 'bubu' | 'dudu'
  pose: 'idle' | 'happy' | 'sad' | 'wave' | 'hug'
  className?: string
  asset?: string
  eager?: boolean
  size?: 'default' | 'large'
}

function Bear({ character, pose, className = '', asset, eager = false, size = 'default' }: BearProps) {
  if (asset?.startsWith('http')) {
    return (
      <div
        aria-label={`${character} bear in ${pose} pose`}
        className={`relative select-none drop-shadow-sm ${className}`}
        role="img"
      >
        <GifImage
          src={asset}
          alt={`${character} bear in ${pose} pose`}
          className={`${size === 'large' ? 'h-24 w-24 min-h-24 min-w-24 shrink-0' : 'h-16 w-16'} object-contain`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    )
  }

  const Icon = pose === 'wave' ? Hand : pose === 'hug' ? Heart : pose === 'sad' ? Frown : pose === 'happy' ? Smile : PawPrint
  const color = character === 'dudu' ? '#9B8E86' : '#8B6145'

  return (
    <div
      aria-label={`${character} bear in ${pose} pose`}
      className={`relative select-none drop-shadow-sm ${className}`}
      role="img"
    >
      <PawPrint
        aria-hidden="true"
        className="h-16 w-16"
        color={color}
        fill={pose === 'hug' ? color : 'none'}
        strokeWidth={1.8}
      />
      <Icon
        aria-hidden="true"
        className={`absolute ${pose === 'wave' ? '-right-2 -top-3' : '-right-1 -top-1'} h-6 w-6`}
        color={pose === 'sad' ? '#A92F49' : color}
        fill={pose === 'hug' ? '#FFD6E0' : 'none'}
        strokeWidth={1.8}
      />
      <span className="sr-only">{pose}</span>
    </div>
  )
}

export default Bear
