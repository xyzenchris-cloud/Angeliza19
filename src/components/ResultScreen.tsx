import GifImage from './GifImage'
import PrimaryButton from './PrimaryButton'

type ResultScreenProps = {
  gif: string
  gifAlt: string
  heading: string
  subtext: string
  buttonLabel: string
  onAction: () => void
  className?: string
}

function ResultScreen({
  gif,
  gifAlt,
  heading,
  subtext,
  buttonLabel,
  onAction,
  className = '',
}: ResultScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-cream/90 px-6 text-center ${className}`}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onPointerCancel={(event) => event.stopPropagation()}
    >
      <GifImage
        src={gif}
        alt={gifAlt}
        className="mb-3 h-28 w-auto max-w-[75%] object-contain"
        loading="eager"
        draggable={false}
      />
      <h2 className="font-display text-3xl font-bold text-ink">{heading}</h2>
      <p className="mt-2 text-muted">{subtext}</p>
      <PrimaryButton className="relative z-30 mt-5" onClick={onAction}>
        {buttonLabel}
      </PrimaryButton>
    </div>
  )
}

export default ResultScreen
