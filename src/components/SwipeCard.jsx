import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { priceLabels } from '../data/mockRestaurants'

const SWIPE_THRESHOLD = 100

export default function SwipeCard({
  restaurant,
  isTop,
  stackIndex,
  onSwipe,
  onUndoAvailable,
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-18, 18])
  const yumOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  const [imgLoaded, setImgLoaded] = useState(false)
  const [exitDir, setExitDir] = useState(0)

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info
    const swipe = offset.x * velocity.x

    if (offset.x > SWIPE_THRESHOLD || swipe > 10000) {
      setExitDir(1)
      onSwipe('yum')
    } else if (offset.x < -SWIPE_THRESHOLD || swipe < -10000) {
      setExitDir(-1)
      onSwipe('nope')
    }
  }

  const stackScale = 1 - stackIndex * 0.045
  const stackY = stackIndex * 12

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackIndex,
        cursor: isTop ? 'grab' : 'default',
      }}
      initial={{
        scale: stackScale,
        y: stackY + 30,
        opacity: 0,
      }}
      animate={{
        scale: stackScale,
        y: stackY,
        opacity: stackIndex > 2 ? 0 : 1,
      }}
      exit={{
        x: exitDir * 600,
        rotate: exitDir * 35,
        opacity: 0,
        transition: { duration: 0.4, ease: 'easeIn' },
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 26,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl
                    border border-white/5"
      >
        {/* Background: gradient (always) + image (if loaded) */}
        <div
          className="absolute inset-0"
          style={{ background: restaurant.gradient }}
        />
        {restaurant.image && (
          <>
            <img
              src={restaurant.image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
            />
          </>
        )}

        {/* Dark gradient overlay from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(11,11,17,0.95) 0%, rgba(11,11,17,0.7) 35%, rgba(11,11,17,0.1) 60%, transparent 100%)',
          }}
        />

        {/* Cuisine emoji badge */}
        <div className="absolute top-5 left-5 z-10">
          <div className="bg-night/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
            <span className="text-2xl">{restaurant.emoji}</span>
            <span className="ml-2 text-xs font-medium text-cream/80">
              {restaurant.cuisine}
            </span>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-5 right-5 z-10">
          <div className="bg-night/60 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 flex items-center gap-1">
            <span className="text-amber text-sm">★</span>
            <span className="text-sm font-bold text-cream">
              {restaurant.rating}
            </span>
          </div>
        </div>

        {/* YUM stamp */}
        {isTop && (
          <motion.div className="stamp-yum" style={{ opacity: yumOpacity }}>
            YUM 👍
          </motion.div>
        )}

        {/* NOPE stamp */}
        {isTop && (
          <motion.div className="stamp-nope" style={{ opacity: nopeOpacity }}>
            NOPE ✋
          </motion.div>
        )}

        {/* Restaurant info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          {/* Name */}
          <h2 className="font-cn font-black text-3xl text-cream leading-tight mb-2 drop-shadow-lg">
            {restaurant.name}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-sm text-cream/70 mb-3">
            <span className="font-display font-bold text-amber">
              {priceLabels[restaurant.priceRange].repeat(restaurant.priceRange)}
            </span>
            <span className="w-1 h-1 bg-cream/30 rounded-full" />
            <span>~NT${restaurant.avgPrice}</span>
            <span className="w-1 h-1 bg-cream/30 rounded-full" />
            <span>📍 {restaurant.distance}km</span>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium
                           bg-white/10 backdrop-blur-sm text-cream/80 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
