import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF6F0',
        blush: '#FFD6E0',
        bubu: '#B98764',
        dudu: '#F5F0EC',
        heart: '#FF6B81',
        gold: '#FFD479',
        ink: '#6F4228',
        muted: '#77553F',
        'heart-strong': '#A92F49',
      },
      fontFamily: {
        display: ['Short Stack', 'Comic Sans MS', 'cursive', 'sans-serif'],
        body: ['Short Stack', 'Comic Sans MS', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
