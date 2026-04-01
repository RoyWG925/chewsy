import { motion } from 'framer-motion'

const floatingEmojis = ['🍜', '🍕', '🍔', '🌮', '🍣', '🥘', '🍰', '☕', '🍛', '🫕', '🥟', '🍝']

const emojiPositions = floatingEmojis.map((emoji, i) => ({
  emoji,
  left: `${(i * 23 + 7) % 90}%`,
  top: `${(i * 17 + 12) % 80}%`,
  size: 28 + (i % 3) * 12,
  delay: i * 0.3,
  duration: 5 + (i % 4),
}))

export default function Landing({ onCreateRoom, onJoinRoom }) {
  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="orb w-72 h-72 bg-coral top-[-10%] left-[-15%]" />
      <div className="orb w-96 h-96 bg-amber bottom-[-15%] right-[-20%]" />
      <div className="orb w-64 h-64 bg-lavender top-[40%] right-[-10%]" />

      {/* Floating food emojis */}
      {emojiPositions.map(({ emoji, left, top, size, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute select-none pointer-events-none"
          style={{ left, top, fontSize: size }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.35, 0.35, 0],
            y: [20, -15, -15, 20],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {/* Logo emoji */}
        <motion.div
          className="text-7xl mb-4"
          variants={{
            hidden: { opacity: 0, scale: 0.3, rotate: -20 },
            visible: {
              opacity: 1,
              scale: 1,
              rotate: 0,
              transition: { type: 'spring', stiffness: 200, damping: 12 },
            },
          }}
        >
          🍽️
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-cn font-black text-5xl sm:text-6xl leading-tight mb-3"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <span className="text-gradient-coral">到底要</span>
          <br />
          <span className="text-cream">吃什麼？</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-muted text-lg mb-2 font-display font-medium"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
        >
          別再吵了。滑一滑就知道。
        </motion.p>

        <motion.p
          className="text-muted/60 text-sm mb-10"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
        >
          Group Decision, Not Group Debate.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col gap-4 w-full max-w-xs mx-auto"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
        >
          <motion.button
            onClick={onCreateRoom}
            className="relative w-full py-4 px-8 rounded-2xl font-display font-bold text-lg text-night
                       bg-gradient-to-r from-coral to-amber
                       shadow-lg shadow-coral/25 active:scale-95 transition-transform"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🔥 開團選餐廳
          </motion.button>

          <motion.button
            onClick={onJoinRoom}
            className="w-full py-4 px-8 rounded-2xl font-display font-bold text-lg text-cream
                       bg-surface-light border border-cream/10
                       hover:border-cream/25 active:scale-95 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🎫 輸入房間碼加入
          </motion.button>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mt-12 flex items-center gap-6 text-muted/70 text-xs"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.8, duration: 0.6 } },
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👈</span>
            <span>不要</span>
          </div>
          <div className="w-8 h-px bg-muted/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">📱</span>
            <span>滑卡片</span>
          </div>
          <div className="w-8 h-px bg-muted/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">👉</span>
            <span>可以</span>
          </div>
          <div className="w-8 h-px bg-muted/30" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🎯</span>
            <span>配對</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
