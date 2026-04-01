import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

export default function WaitingRoom({
  roomCode,
  isHost,
  players,
  maxPlayers,
  onStart,
  onBack,
}) {
  const [copied, setCopied] = useState(false)
  const playerCount = players ? Object.keys(players).length : 0
  const canStart = playerCount >= 2

  // Build a shareable join URL
  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '到底要吃什麼？',
          text: `加入我的選餐房間！房間碼：${roomCode}`,
          url: joinUrl,
        })
      } catch {}
    } else {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative h-full flex flex-col items-center px-6 pt-12 pb-8 overflow-hidden">
      {/* Ambient */}
      <div className="orb w-72 h-72 bg-amber top-[-10%] right-[-15%]" />
      <div className="orb w-56 h-56 bg-mint bottom-[10%] left-[-15%]" />

      {/* Header */}
      <motion.div
        className="relative z-10 text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-5xl mb-3">📡</div>
        <h2 className="font-cn font-bold text-2xl mb-1">等待夥伴加入</h2>
        <p className="text-muted text-sm">分享房間碼給朋友</p>
      </motion.div>

      {/* Room code display */}
      <motion.div
        className="relative z-10 w-full max-w-xs"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        {/* Big code */}
        <motion.button
          onClick={copyCode}
          className="w-full py-5 rounded-2xl bg-surface border-2 border-amber/30
                     flex flex-col items-center gap-2 active:scale-95 transition-transform"
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-4xl font-display font-black tracking-[0.4em] text-amber">
            {roomCode}
          </span>
          <span className="text-xs text-muted">
            {copied ? '✅ 已複製！' : '點擊複製房間碼'}
          </span>
        </motion.button>

        {/* QR Code */}
        <motion.div
          className="mt-5 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-3 bg-cream rounded-2xl">
            <QRCodeSVG
              value={joinUrl}
              size={140}
              bgColor="#F0EBE3"
              fgColor="#0B0B11"
              level="M"
            />
          </div>
        </motion.div>

        {/* Share button */}
        <motion.button
          onClick={shareLink}
          className="w-full mt-4 py-3 rounded-2xl font-display font-bold text-sm
                     bg-surface-light border border-cream/10 text-cream
                     hover:border-cream/20 active:scale-95 transition-all"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          📤 分享連結給朋友
        </motion.button>
      </motion.div>

      {/* Player count */}
      <motion.div
        className="relative z-10 mt-8 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted">已加入</span>
          <span className="font-display font-bold text-mint">
            {playerCount} / {maxPlayers}
          </span>
        </div>

        {/* Player slots */}
        <div className="flex gap-3 justify-center">
          {Array.from({ length: maxPlayers }, (_, i) => {
            const filled = i < playerCount
            return (
              <motion.div
                key={i}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
                           border-2 transition-all ${
                             filled
                               ? 'bg-mint/15 border-mint/40'
                               : 'bg-surface border-cream/10'
                           }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
              >
                {filled ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    🧑
                  </motion.span>
                ) : (
                  <motion.span
                    className="text-muted/40"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ·
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {!canStart && (
          <motion.p
            className="text-center text-muted text-xs mt-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            等待更多人加入...
          </motion.p>
        )}
      </motion.div>

      {/* Bottom actions */}
      <div className="relative z-10 mt-auto w-full max-w-xs flex flex-col gap-3">
        {isHost && (
          <motion.button
            onClick={onStart}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-display font-bold text-lg transition-all ${
              canStart
                ? 'bg-gradient-to-r from-coral to-amber text-night shadow-lg shadow-coral/25'
                : 'bg-surface-light text-muted/40 cursor-not-allowed'
            }`}
            whileTap={canStart ? { scale: 0.97 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {canStart ? '🚀 開始配對！' : `等待至少 2 人加入`}
          </motion.button>
        )}

        {!isHost && (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.p
              className="text-muted text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              等待房主開始...
            </motion.p>
          </motion.div>
        )}

        <motion.button
          onClick={onBack}
          className="w-full py-3 rounded-2xl font-display font-bold text-muted
                     bg-surface border border-cream/10 hover:border-cream/20 transition-all"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ← 離開房間
        </motion.button>
      </div>
    </div>
  )
}
