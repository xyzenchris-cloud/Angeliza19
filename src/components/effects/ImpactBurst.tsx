type ImpactBurstProps = {
  size?: number
  color?: string
  className?: string
}

function ImpactBurst({ size = 96, color = '#FFD479', className }: ImpactBurstProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 3L59 20L74 8L75 28L96 24L84 42L100 50L82 59L94 76L74 73L76 96L58 83L50 100L41 82L24 94L26 74L4 76L17 58L0 50L18 41L6 24L27 28L25 7L42 20L50 3Z"
        fill={color}
        stroke="#6F4228"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M50 20L55 35L70 30L64 44L80 50L64 56L70 71L55 65L50 82L45 65L30 71L36 56L20 50L36 44L30 29L45 35L50 20Z"
        fill="#FFF6F0"
        fillOpacity="0.35"
      />
    </svg>
  )
}

export default ImpactBurst
