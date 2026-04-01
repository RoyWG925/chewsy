import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { locations } from '../data/mockRestaurants'

const budgetOptions = [
  { value: 1, label: '$', desc: '100 以下', emoji: '🪙' },
  { value: 2, label: '$$', desc: '100-300', emoji: '💵' },
  { value: 3, label: '$$$', desc: '300-600', emoji: '💰' },
  { value: 4, label: '$$$$', desc: '600+', emoji: '💎' },
]

const peopleOptions = [2, 3, 4, 5, 6]

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function Setup({ onStart }) {
  const [step, setStep] = useState(0)
  const [location, setLocation] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [people, setPeople] = useState(2)

  const toggleBudget = (val) => {
    setBudgets((prev) =>
      prev.includes(val) ? prev.filter((b) => b !== val) : [...prev, val]
    )
  }

  const canProceed = () => {
    if (step === 0) return location !== null
    if (step === 1) return budgets.length > 0
    if (step === 2) return true
    return false
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      const roomCode = generateRoomCode()
      onStart({ location, budgets, people, roomCode })
    }
  }

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  }

  return (
    <div className="relative h-full flex flex-col px-6 pt-12 pb-8 overflow-hidden">
      {/* Ambient */}
      <div className="orb w-64 h-64 bg-amber top-[-10%] right-[-15%]" />
      <div className="orb w-48 h-48 bg-coral bottom-[10%] left-[-10%]" />

      {/* Header */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚙️</span>
          <h2 className="font-cn font-bold text-2xl">設定條件</h2>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full"
              animate={{
                width: i === step ? 40 : 12,
                backgroundColor:
                  i < step ? '#1EEBB8' : i === step ? '#FFB443' : '#22222E',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Steps */}
      <div className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-location"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h3 className="font-display font-bold text-xl text-cream mb-2">
                📍 你們在哪裡？
              </h3>
              <p className="text-muted text-sm mb-6">選擇所在區域</p>

              <div className="grid grid-cols-2 gap-3">
                {locations.map((loc) => (
                  <motion.button
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      location === loc.id
                        ? 'bg-amber/15 border-amber/50 shadow-lg shadow-amber/10'
                        : 'bg-surface border-transparent hover:border-cream/10'
                    }`}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="text-2xl">{loc.emoji}</span>
                    <p className="font-cn font-bold mt-1 text-sm">{loc.name}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-budget"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h3 className="font-display font-bold text-xl text-cream mb-2">
                💰 預算範圍？
              </h3>
              <p className="text-muted text-sm mb-6">可以多選</p>

              <div className="flex flex-col gap-3">
                {budgetOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => toggleBudget(opt.value)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                      budgets.includes(opt.value)
                        ? 'bg-mint/10 border-mint/40 shadow-lg shadow-mint/10'
                        : 'bg-surface border-transparent hover:border-cream/10'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="text-left">
                      <p className="font-display font-bold text-lg">
                        {opt.label}
                      </p>
                      <p className="text-muted text-xs">NT{opt.desc}</p>
                    </div>
                    {budgets.includes(opt.value) && (
                      <motion.span
                        className="ml-auto text-mint text-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-people"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h3 className="font-display font-bold text-xl text-cream mb-2">
                👥 幾個人？
              </h3>
              <p className="text-muted text-sm mb-8">選擇用餐人數</p>

              <div className="flex justify-center gap-4">
                {peopleOptions.map((num) => (
                  <motion.button
                    key={num}
                    onClick={() => setPeople(num)}
                    className={`w-16 h-16 rounded-2xl font-display font-bold text-2xl
                               flex items-center justify-center transition-all border ${
                                 people === num
                                   ? 'bg-lavender/15 border-lavender/50 text-lavender shadow-lg shadow-lavender/15'
                                   : 'bg-surface border-transparent text-muted hover:border-cream/10'
                               }`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    {num}
                  </motion.button>
                ))}
              </div>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-5xl mb-3">
                  {Array.from({ length: people }, (_, i) => (
                    <span key={i}>🧑</span>
                  ))}
                </div>
                <p className="text-muted text-sm">
                  {people} 人一起決定
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <motion.div className="relative z-10 mt-4" layout>
        <div className="flex gap-3">
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              onClick={() => setStep(step - 1)}
              className="py-4 px-6 rounded-2xl font-display font-bold text-muted
                         bg-surface border border-cream/10 active:scale-95 transition-transform"
              whileTap={{ scale: 0.95 }}
            >
              ←
            </motion.button>
          )}
          <motion.button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 py-4 px-8 rounded-2xl font-display font-bold text-lg
                        active:scale-95 transition-all ${
                          canProceed()
                            ? 'bg-gradient-to-r from-coral to-amber text-night shadow-lg shadow-coral/25'
                            : 'bg-surface-light text-muted/40 cursor-not-allowed'
                        }`}
            whileTap={canProceed() ? { scale: 0.97 } : {}}
          >
            {step === 2 ? '🚀 開始配對！' : '下一步 →'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
