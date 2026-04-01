import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { priceLabels } from '../data/mockRestaurants'

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ['#FF5757', '#FFB443', '#1EEBB8', '#8B7BF7', '#FF69B4', '#FEFAE0']
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[i % colors.length],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }))
  }, [])

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  )
}

export default function Results({ matches, allRestaurants, myChoices, onSpin, onRestart }) {
  const [phase, setPhase] = useState('calculating')
  const [revealIndex, setRevealIndex] = useState(-1)

  useEffect(() => {
    // Calculating phase
    const timer1 = setTimeout(() => setPhase('revealing'), 2500)
    return () => clearTimeout(timer1)
  }, [])

  useEffect(() => {
    if (phase !== 'revealing') return
    if (revealIndex < matches.length - 1) {
      const timer = setTimeout(() => setRevealIndex((i) => i + 1), 600)
      return () => clearTimeout(timer)
    }
  }, [phase, revealIndex, matches.length])

  const allRevealed = revealIndex >= matches.length - 1

  // Calculate stats
  const yumCount = Object.values(myChoices).filter((c) => c === 'yum').length
  const nopeCount = Object.values(myChoices).filter((c) => c === 'nope').length

  return (
    <div className="relative h-full flex flex-col px-6 overflow-hidden">
      {/* Ambient */}
      <div className="orb w-72 h-72 bg-mint top-[-10%] left-[-15%] opacity-20" />
      <div className="orb w-56 h-56 bg-lavender bottom-[10%] right-[-10%] opacity-15" />

      {/* Confetti on match */}
      {phase === 'revealing' && matches.length > 0 && <Confetti />}

      {/* Calculating phase */}
      <AnimatePresence mode="wait">
        {phase === 'calculating' && (
          <motion.div
            key="calc"
            className="flex-1 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Animated rings */}
            <div className="relative w-32 h-32 mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-coral/40"
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-amber/40"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-2 border-mint/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-5xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                🔍
              </motion.div>
            </div>

            <motion.h2
              className="font-cn font-bold text-2xl mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              比對結果中...
            </motion.h2>
            <p className="text-muted text-sm">
              分析 {allRestaurants.length} 家餐廳的配對結果
            </p>
          </motion.div>
        )}

        {phase === 'revealing' && (
          <motion.div
            key="reveal"
            className="flex-1 flex flex-col pt-10 pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Stats header */}
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="text-4xl mb-2">
                {matches.length > 0 ? '🎉' : '😅'}
              </div>
              <h2 className="font-cn font-bold text-2xl mb-1">
                {matches.length > 0
                  ? `找到 ${matches.length} 個共識！`
                  : '唉呀，沒有交集...'}
              </h2>
              <p className="text-muted text-sm">
                你 👍 了 {yumCount} 家 · 👎 了 {nopeCount} 家
              </p>
            </motion.div>

            {/* Match list */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {matches.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ x: 60, opacity: 0, scale: 0.9 }}
                  animate={
                    i <= revealIndex
                      ? { x: 0, opacity: 1, scale: 1 }
                      : { x: 60, opacity: 0, scale: 0.9 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-mint/20
                             shadow-lg shadow-mint/5"
                >
                  {/* Rank badge */}
                  <div className="w-10 h-10 rounded-xl bg-mint/15 flex items-center justify-center
                                  font-display font-bold text-mint text-lg shrink-0">
                    {i + 1}
                  </div>

                  {/* Emoji + image */}
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden shrink-0 card-image
                               flex items-center justify-center text-2xl"
                    style={{
                      backgroundImage: `url(${restaurant.image})`,
                      background: restaurant.image
                        ? undefined
                        : restaurant.gradient,
                    }}
                  >
                    {!restaurant.image && restaurant.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cn font-bold text-cream truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-muted text-xs">
                      {restaurant.cuisine} · {priceLabels[restaurant.priceRange].repeat(restaurant.priceRange)} · {restaurant.distance}km
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-amber text-xs">★</span>
                      <span className="font-display font-bold text-sm">
                        {restaurant.rating}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            {allRevealed && (
              <motion.div
                className="mt-2 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {matches.length > 1 ? (
                  <motion.button
                    onClick={() => onSpin(matches)}
                    className="w-full py-4 px-8 rounded-2xl font-display font-bold text-lg text-night
                               bg-gradient-to-r from-mint to-lavender
                               shadow-lg shadow-mint/25 active:scale-95 transition-transform"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    🎰 轉盤決定！
                  </motion.button>
                ) : matches.length === 1 ? (
                  <motion.div
                    className="text-center p-6 rounded-2xl bg-mint/10 border border-mint/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.5 }}
                  >
                    <p className="text-mint font-display font-bold text-lg">
                      🎯 就決定是你了！
                    </p>
                    <p className="font-cn font-bold text-2xl mt-1">
                      {matches[0].name}
                    </p>
                  </motion.div>
                ) : null}

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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
