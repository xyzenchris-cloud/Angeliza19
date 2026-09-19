import Bear from './Bear'

type BearDuoProps = {
  pose: 'happy' | 'hug'
  className?: string
}

function BearDuo({ pose, className = '' }: BearDuoProps) {
  return (
    <div aria-label={`Bubu and Dudu in ${pose} pose`} className={`flex justify-center gap-1 ${className}`}>
      <Bear character="bubu" pose={pose} />
      <Bear character="dudu" pose={pose} />
    </div>
  )
}

export default BearDuo
