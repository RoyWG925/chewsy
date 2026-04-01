import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeCard from './SwipeCard'

export default function SwipeSession({ restaurants, onSwipe, onComplete, players, playerId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [choices, setChoices] = useState({})
  const [lastChoice, setLastChoice] = useState(null)
  const completedRef = useRef(false)

  const progress = currentIndex / restaurants.length
  const remaining = restaurants.length - currentIndex
  const isDone = currentIndex >= restaurants.length

  // Calculate other players' progress
  const otherPlayers = players ? Object.entries(players).filter(([id]) => id !== playerId) : []
  const otherProgress = otherPlayers.map(([id, p]) => {
    const choiceCount = p.choices ? Object.keys(p.choices).length : 0
    return { id, progress: choiceCount / restaurants.length, ready: p.ready }
  })

  const handleSwipe = useCallback(
    (direction) => {
      const restaurant = restaurants[currentIndex]
      const newChoices = { ...choices, [restaurant.id]: direction }
      setChoices(newChoices)
      setLastChoice({ id: restaurant.id, direction })
      setCurrentIndex((prev) => prev + 1)

      // Send to Firebase
      if (onSwipe) onSwipe(restaurant.id, direction)
    },
    [currentIndex, restaurants, choices, onSwipe]
  )

  const handleUndo = useCallback(() => {
    if (currentIndex === 0 || !lastChoice) return
    setCurrentIndex((prev) => prev - 1)
    setChoices((prev) => {
      const next = { ...prev }
      delete next[lastChoice.id]
      return next
    })
    setLastChoice(null)
  }, [currentIndex, lastChoice])

  const handleButtonSwipe = (direction) => {
    handleSwipe(direction)
  }

  // When done, trigger completion once
  useEffect(() => {
    if (isDone && Object.keys(choices).length === restaurants.length && !completedRef.current) {
      completedRef.current = true
      const timer = setTimeout(() => onComplete(choices), 600)
      return () => clearTimeout(timer)
    }
  }, [isDone, choices, restaurants.length, onComplete])

  const visibleCards = restaurants
    .slice(currentIndex, currentIndex + 3)
    .reverse()

  const yumCount = Object.values(choices).filter((c) => c === 'yum').length
  const nopeCount = Object.values(choices).filter((c) => c === 'nope').length

  return (
    <div className="relative h-full flex flex-col px-4 pt-6 pb-6 overflow-hidden">
      {/* Ambient */}
      <div className="orb w-56 h-56 bg-coral top-[-8%] right-[-15%] opacity-10" />
      <div className="orb w-40 h-40 bg-mint bottom-[5%] left-[-10%] opacity-10" />

      {/* Top bar */}
      <div className="relative z-20 mb-4">
        {/* Progress bar */}
        <div className="h-1.5 bg-surface-light rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full progress-shimmer"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-mint font-display font-bold">
              👍 {yumCount}
            </span>
            <span className="text-coral font-display font-bold">
              👎 {nopeCount}
            </span>
          </div>
          <span className="text-muted">
            {isDone ? '完成!' : `剩餘 ${remaining} 家`}
          </span>
        </div>

        {/* Other players' progress */}
        {otherProgress.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted/60">夥伴進度</span>
            <div className="flex gap-1.5 flex-1">
              {otherProgress.map((op) => (
                <div key={op.id} className="flex-1">
                  <div className="h-1 bg-surface-light rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: op.ready ? '#1EEBB8' : '#8B7BF7' }}
                      animate={{ width: `${op.progress * 100}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {otherProgress.every((op) => op.ready) && (
              <span className="text-xs text-mint">✓ 都滑完了</span>
            )}
          </div>
        )}
      </div>

      {/* Card stack area */}
      <div className="relative z-10 flex-1 min-h-0">
        <div className="relative w-full h-full max-w-sm mx-auto">
          <AnimatePresence>
            {!isDone &&
              visibleCards.map((restaurant) => {
                const stackIndex = restaurant.id === restaurants[currentIndex]?.id
                  ? 0
                  : restaurant.id === restaurants[currentIndex + 1]?.id
                  ? 1
                  : 2
                return (
                  <SwipeCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isTop={stackIndex === 0}
                    stackIndex={stackIndex}
                    onSwipe={handleSwipe}
                  />
                )
              })}
          </AnimatePresence>

          {/* Done state */}
          {isDone && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="text-7xl mb-4">🎉</div>
              <h3 className="font-cn font-bold text-2xl mb-2">滑完了！</h3>
              <p className="text-muted mb-4">正在等待其他人...</p>

              {/* Show who's still swiping */}
              {otherProgress.length > 0 && (
                <div className="flex flex-col gap-2 w-48">
                  {otherProgress.map((op, i) => (
                    <div key={op.id} className="flex items-center gap-2">
                      <span className="text-sm">🧑</span>
                      <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: op.ready ? '#1EEBB8' : '#FFB443' }}
                          animate={{ width: `${op.progress * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted">
                        {op.ready ? '✅' : `${Math.round(op.progress * 100)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom action buttons */}
      {!isDone && (
        <motion.div
          className="relative z-20 flex items-center justify-center gap-5 mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Nope button */}
          <motion.button
            onClick={() => handleButtonSwipe('nope')}
            className="w-16 h-16 rounded-full bg-surface border-2 border-coral/30
                       flex items-center justify-center text-2xl
                       shadow-lg shadow-coral/10 active:bg-coral/20 transition-colors"
            whileHover={{ scale: 1.1, borderColor: 'rgba(255,87,87,0.6)' }}
            whileTap={{ scale: 0.9 }}
          >
            ✋
          </motion.button>

          {/* Undo button */}
          <motion.button
            onClick={handleUndo}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full bg-surface border border-cream/10
                       flex items-center justify-center text-lg transition-colors ${
                         currentIndex === 0
                           ? 'opacity-30 cursor-not-allowed'
                           : 'hover:border-cream/30 active:bg-surface-light'
                       }`}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
          >
            ↩️
          </motion.button>

          {/* Yum button */}
          <motion.button
            onClick={() => handleButtonSwipe('yum')}
            className="w-16 h-16 rounded-full bg-surface border-2 border-mint/30
                       flex items-center justify-center text-2xl
                       shadow-lg shadow-mint/10 active:bg-mint/20 transition-colors"
            whileHover={{ scale: 1.1, borderColor: 'rgba(30,235,184,0.6)' }}
            whileTap={{ scale: 0.9 }}
          >
            👍
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
