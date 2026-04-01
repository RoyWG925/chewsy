import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WHEEL_COLORS = [
  '#FF5757', '#FFB443', '#1EEBB8', '#8B7BF7',
  '#FF8C42', '#45B7D1', '#FF69B4', '#A3E635',
]

export default function SpinWheel({ matches, onResult, onRestart }) {
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [targetRotation, setTargetRotation] = useState(0)

  const segmentAngle = 360 / matches.length

  const conicGradient = useMemo(() => {
    return matches
      .map((_, i) => {
        const color = WHEEL_COLORS[i % WHEEL_COLORS.length]
        const start = i * segmentAngle
        const end = (i + 1) * segmentAngle
        return `${color} ${start}deg ${end}deg`
      })
      .join(', ')
  }, [matches, segmentAngle])

  const spin = () => {
    if (spinning) return
    setWinner(null)

    const winnerIndex = Math.floor(Math.random() * matches.length)
    const fullSpins = 5 + Math.floor(Math.random() * 3)
    // Calculate target: pointer is at top (0deg), the segment at index i starts at i*segmentAngle
    // We want the middle of winnerIndex segment to be at the top
    const segmentMiddle = winnerIndex * segmentAngle + segmentAngle / 2
    const target = fullSpins * 360 + (360 - segmentMiddle)

    setTargetRotation(target)
    setSpinning(true)

    setTimeout(() => {
      setWinner(matches[winnerIndex])
      setSpinning(false)
    }, 5000)
  }

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient */}
      <div className="orb w-80 h-80 bg-lavender top-[10%] left-[-20%] opacity-15" />
      <div className="orb w-60 h-60 bg-amber bottom-[5%] right-[-15%] opacity-15" />

      <AnimatePresence mode="wait">
        {!winner ? (
          <motion.div
            key="wheel"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {/* Title */}
            <motion.h2
              className="font-cn font-bold text-2xl mb-8 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              🎰 轉盤決定命運！
            </motion.h2>

            {/* Wheel container */}
            <div className="relative">
              {/* Pointer triangle */}
              <div
                className="absolute top-[-14px] left-1/2 -translate-x-1/2 z-20"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '14px solid transparent',
                  borderRight: '14px solid transparent',
                  borderTop: '28px solid #F0EBE3',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                }}
              />

              {/* Outer ring glow */}
              <motion.div
                className="absolute -inset-3 rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,87,87,0.3), rgba(139,123,247,0.3), rgba(30,235,184,0.3))',
                  filter: 'blur(12px)',
                }}
                animate={
                  spinning
                    ? { opacity: [0.3, 0.8, 0.3] }
                    : { opacity: 0.3 }
                }
                transition={
                  spinning
                    ? { duration: 0.5, repeat: Infinity }
                    : {}
                }
              />

              {/* Wheel */}
              <motion.div
                className="relative w-72 h-72 rounded-full shadow-2xl border-4 border-cream/20"
                style={{
                  background: `conic-gradient(${conicGradient})`,
                }}
                animate={{ rotate: targetRotation }}
                transition={{
                  duration: 4.5,
                  ease: [0.17, 0.67, 0.12, 0.99],
                }}
              >
                {/* Center circle */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-14 h-14 rounded-full bg-night border-2 border-cream/30
                              flex items-center justify-center text-xl z-10 shadow-lg"
                >
                  🍽️
                </div>

                {/* Segment labels */}
                {matches.map((m, i) => {
                  const angle = i * segmentAngle + segmentAngle / 2
                  return (
                    <div
                      key={m.id}
                      className="absolute top-1/2 left-1/2 w-1/2 h-0"
                      style={{
                        transformOrigin: '0 0',
                        transform: `rotate(${angle - 90}deg)`,
                      }}
                    >
                      <span
                        className="absolute left-[30%] -translate-y-1/2
                                   text-xs font-bold text-white drop-shadow-lg
                                   whitespace-nowrap max-w-[70px] truncate"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {m.emoji} {m.name}
                      </span>
                    </div>
                  )
                })}

                {/* Segment divider lines */}
                {matches.map((_, i) => {
                  const angle = i * segmentAngle
                  return (
                    <div
                      key={`line-${i}`}
                      className="absolute top-1/2 left-1/2 w-1/2 h-px bg-white/20"
                      style={{
                        transformOrigin: '0 0',
                        transform: `rotate(${angle - 90}deg)`,
                      }}
                    />
                  )
                })}
              </motion.div>
            </div>

            {/* Spin button */}
            <motion.button
              onClick={spin}
              disabled={spinning}
              className={`mt-10 py-4 px-12 rounded-2xl font-display font-bold text-xl
                          transition-all ${
                            spinning
                              ? 'bg-surface-light text-muted cursor-not-allowed'
                              : 'bg-gradient-to-r from-lavender to-coral text-white shadow-lg shadow-lavender/30'
                          }`}
              whileHover={!spinning ? { scale: 1.05 } : {}}
              whileTap={!spinning ? { scale: 0.95 } : {}}
              animate={
                spinning
                  ? { opacity: [0.5, 1, 0.5] }
                  : { opacity: 1 }
              }
              transition={
                spinning
                  ? { duration: 0.8, repeat: Infinity }
                  : {}
              }
            >
              {spinning ? '🌀 轉轉轉...' : '👆 按我開轉！'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
          >
            {/* Winner celebration */}
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              🎊
            </motion.div>

            <motion.h2
              className="font-cn font-bold text-xl text-muted mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              今天就吃這家！
            </motion.h2>

            <motion.div
              className="px-8 py-6 rounded-3xl bg-surface border-2 border-mint/30
                         shadow-2xl shadow-mint/10 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              <div className="text-5xl mb-3">{winner.emoji}</div>
              <h3 className="font-cn font-black text-3xl text-gradient-mint mb-2">
                {winner.name}
              </h3>
              <p className="text-muted">
                {winner.cuisine} · ★ {winner.rating} · {winner.distance}km
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3 w-full max-w-xs mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                onClick={onRestart}
                className="w-full py-3 px-8 rounded-2xl font-display font-bold text-muted
                           bg-surface border border-cream/10
                           hover:border-cream/20 active:scale-95 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                🔄 再來一次
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
