import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { playTap } from '../lib/sfx'

type PrimaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

function PrimaryButton({
  children,
  variant = 'primary',
  className = '',
  disabled,
  onClick,
  ...props
}: PrimaryButtonProps) {
  const colors =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[#A92F49] to-[#B83C56] text-white shadow-lg shadow-heart/20'
      : 'border-2 border-heart-strong bg-transparent text-heart-strong'

  return (
    <button
      type="button"
      className={`min-h-12 rounded-full px-8 py-3 text-lg font-bold transition-transform duration-150 ease-spring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-heart/30 active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${colors} ${className}`}
      disabled={disabled}
      onClick={(event) => {
        playTap()
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
