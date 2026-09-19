type EnvelopeProps = {
  color?: string
  state?: 'hidden' | 'revealed' | 'opened'
  className?: string
}

function Envelope({ color = '#B98764', state = 'hidden', className = '' }: EnvelopeProps) {
  const gradientId = `envelope-paper-${state}`
  const paper = state === 'opened' ? '#EDE2D5' : '#F4EBDD'

  return (
    <svg
      className={className}
      viewBox="0 0 140 104"
      role="img"
      aria-label={state === 'opened' ? 'Opened envelope' : state === 'revealed' ? 'Envelope' : 'Envelope hidden in clutter'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="22" y1="12" x2="118" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor={paper} />
          <stop offset="1" stopColor="#DCCBB9" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="124" height="84" rx="4" fill={`url(#${gradientId})`} stroke={color} strokeWidth="2.5" />
      <path d="M10 18L70 61L130 18" fill="#E6D8C8" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M10 90L49 51M130 90L91 51" stroke="#B9A794" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 91H127" stroke="#C8B6A2" strokeWidth="1" opacity=".7" />
      <g transform="translate(70 76)">
        <circle r="10" fill={color} />
        <circle cy="2" r="4" fill="#F4EBDD" opacity=".8" />
        <circle cx="-5" cy="-4" r="2" fill="#F4EBDD" opacity=".8" />
        <circle cy="-6" r="2" fill="#F4EBDD" opacity=".8" />
        <circle cx="5" cy="-4" r="2" fill="#F4EBDD" opacity=".8" />
      </g>
      {state === 'opened' && <path d="M37 31H103" stroke="#B9A794" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  )
}

export default Envelope
