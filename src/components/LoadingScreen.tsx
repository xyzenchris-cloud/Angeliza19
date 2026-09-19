import { motion } from 'framer-motion'

function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center bg-cream px-6 text-center text-heart-strong"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
    >
      <div>
        <motion.div
          aria-hidden="true"
          className="mx-auto mb-4 text-5xl"
          animate={{ opacity: [0.55, 1, 0.55], rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♥
        </motion.div>
        <p className="font-display text-xl font-bold">Getting things ready...</p>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
