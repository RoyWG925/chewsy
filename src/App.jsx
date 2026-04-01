import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import Setup from './components/Setup'
import WaitingRoom from './components/WaitingRoom'
import SwipeSession from './components/SwipeSession'
import Results from './components/Results'
import SpinWheel from './components/SpinWheel'
import { mockRestaurants } from './data/mockRestaurants'
import {
  createRoom,
  joinRoom,
  startSwiping,
  submitChoice,
  markReady,
  goToResults,
  onRoomChange,
  getPlayerId,
  calculateMatches,
  allPlayersReady,
} from './lib/roomService'

const screens = {
  LANDING: 'landing',
  SETUP: 'setup',
  JOIN: 'join',
  WAITING: 'waiting',
  SWIPE: 'swipe',
  RESULTS: 'results',
  SPIN: 'spin',
}

// Page transition wrapper
function ScreenTransition({ children, screenKey }) {
  return (
    <motion.div
      key={screenKey}
      className="absolute inset-0"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const [screen, setScreen] = useState(screens.LANDING)
  const [roomCode, setRoomCode] = useState(null)
  const [roomConfig, setRoomConfig] = useState(null)
  const [playerId] = useState(() => getPlayerId())
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState({})
  const [matches, setMatches] = useState([])
  const [myChoices, setMyChoices] = useState({})
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')

  const unsubRef = useRef(null)
  const screenRef = useRef(screen)
  useEffect(() => { screenRef.current = screen }, [screen])

  // Filtered restaurants based on room config
  const filteredRestaurants = useMemo(() => {
    if (!roomConfig?.budgets?.length) return mockRestaurants
    return mockRestaurants.filter((r) =>
      roomConfig.budgets.includes(r.priceRange)
    )
  }, [roomConfig])

  // Auto-join from URL param (e.g. ?room=A3B7K)
  const autoJoinAttempted = useRef(false)
  useEffect(() => {
    if (autoJoinAttempted.current) return
    autoJoinAttempted.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    if (code && code.length === 5) {
      // Remove param from URL without reload
      window.history.replaceState({}, '', window.location.pathname)
      setJoinCode(code.toUpperCase())
      // Auto-attempt join
      ;(async () => {
        try {
          const result = await joinRoom(code.toUpperCase())
          setRoomCode(result.code)
          setRoomConfig(result.config)
          setIsHost(false)
          subscribeToRoom(result.code)
          setScreen(screens.WAITING)
        } catch (err) {
          setJoinError(err.message)
          setScreen(screens.JOIN)
        }
      })()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to room changes
  const subscribeToRoom = useCallback((code) => {
    if (unsubRef.current) unsubRef.current()

    const unsub = onRoomChange(code, (room) => {
      if (!room) return

      setPlayers(room.players || {})
      setRoomConfig(room.config)

      const s = screenRef.current
      // Auto-transition based on room status
      if (room.status === 'swiping' && s !== screens.SWIPE && s !== screens.RESULTS && s !== screens.SPIN) {
        setScreen(screens.SWIPE)
      }

      if (room.status === 'results' && s !== screens.RESULTS && s !== screens.SPIN) {
        const budgets = room.config?.budgets || []
        const restaurants = mockRestaurants.filter((r) =>
          budgets.length ? budgets.includes(r.priceRange) : true
        )
        const found = calculateMatches(room.players, restaurants)
        setMatches(found)
        setScreen(screens.RESULTS)
      }

      // Check if all players finished swiping → move to results
      if (room.status === 'swiping' && room.players) {
        const allDone = allPlayersReady(room.players)
        if (allDone) {
          goToResults(code)
        }
      }
    })
    unsubRef.current = unsub
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  const handleCreateRoom = () => setScreen(screens.SETUP)
  const handleJoinRoom = () => setScreen(screens.JOIN)

  const handleSetupComplete = async (config) => {
    const restaurantIds = mockRestaurants
      .filter((r) => config.budgets.includes(r.priceRange))
      .map((r) => r.id)

    try {
      const { code } = await createRoom(config, restaurantIds)
      setRoomCode(code)
      setRoomConfig(config)
      setIsHost(true)
      subscribeToRoom(code)
      setScreen(screens.WAITING)
    } catch (err) {
      console.error('Failed to create room:', err)
    }
  }

  const handleJoinSubmit = async () => {
    setJoinError('')
    try {
      const { code, config } = await joinRoom(joinCode)
      setRoomCode(code)
      setRoomConfig(config)
      setIsHost(false)
      subscribeToRoom(code)
      setScreen(screens.WAITING)
    } catch (err) {
      setJoinError(err.message)
    }
  }

  const handleStartSwiping = async () => {
    if (roomCode) await startSwiping(roomCode)
  }

  const handleSwipe = useCallback(
    async (restaurantId, choice) => {
      if (roomCode && playerId) {
        setMyChoices((prev) => ({ ...prev, [restaurantId]: choice }))
        await submitChoice(roomCode, playerId, restaurantId, choice)
      }
    },
    [roomCode, playerId]
  )

  const handleSwipeComplete = useCallback(
    async (choices) => {
      setMyChoices(choices)
      if (roomCode && playerId) {
        await markReady(roomCode, playerId)
      }
    },
    [roomCode, playerId]
  )

  const handleGoToSpin = () => setScreen(screens.SPIN)

  const handleRestart = () => {
    if (unsubRef.current) unsubRef.current()
    setScreen(screens.LANDING)
    setRoomCode(null)
    setRoomConfig(null)
    setIsHost(false)
    setPlayers({})
    setMyChoices({})
    setMatches([])
    setJoinCode('')
    setJoinError('')
  }

  return (
    <div className="relative h-full max-w-lg mx-auto overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      <AnimatePresence mode="wait">
        {screen === screens.LANDING && (
          <ScreenTransition screenKey="landing">
            <Landing
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          </ScreenTransition>
        )}

        {screen === screens.SETUP && (
          <ScreenTransition screenKey="setup">
            <Setup onStart={handleSetupComplete} />
          </ScreenTransition>
        )}

        {screen === screens.JOIN && (
          <ScreenTransition screenKey="join">
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="orb w-64 h-64 bg-lavender top-[20%] right-[-15%]" />
              <motion.div
                className="relative z-10 w-full max-w-xs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl text-center mb-6">🎫</div>
                <h2 className="font-cn font-bold text-2xl text-center mb-6">
                  輸入房間碼
                </h2>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 5))
                  }
                  placeholder="例如 A3B7K"
                  maxLength={5}
                  className="w-full px-6 py-4 rounded-2xl bg-surface border border-cream/10
                             text-center text-2xl font-display font-bold text-cream
                             tracking-[0.3em] placeholder:text-muted/40 placeholder:tracking-normal
                             placeholder:text-base focus:outline-none focus:border-lavender/50
                             transition-colors"
                />
                {joinError && (
                  <motion.p
                    className="text-coral text-sm text-center mt-3"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {joinError}
                  </motion.p>
                )}
                <motion.button
                  onClick={handleJoinSubmit}
                  disabled={joinCode.length < 5}
                  className={`w-full mt-4 py-4 rounded-2xl font-display font-bold text-lg
                              transition-all ${
                                joinCode.length >= 5
                                  ? 'bg-gradient-to-r from-lavender to-mint text-night shadow-lg shadow-lavender/25'
                                  : 'bg-surface-light text-muted/40 cursor-not-allowed'
                              }`}
                  whileTap={joinCode.length >= 5 ? { scale: 0.97 } : {}}
                >
                  加入房間 →
                </motion.button>
                <motion.button
                  onClick={handleRestart}
                  className="w-full mt-3 py-3 rounded-2xl font-display font-bold text-muted
                             hover:text-cream transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  ← 返回
                </motion.button>
              </motion.div>
            </div>
          </ScreenTransition>
        )}

        {screen === screens.WAITING && (
          <ScreenTransition screenKey="waiting">
            <WaitingRoom
              roomCode={roomCode}
              isHost={isHost}
              players={players}
              maxPlayers={roomConfig?.people || 2}
              onStart={handleStartSwiping}
              onBack={handleRestart}
            />
          </ScreenTransition>
        )}

        {screen === screens.SWIPE && (
          <ScreenTransition screenKey="swipe">
            <SwipeSession
              restaurants={filteredRestaurants}
              onSwipe={handleSwipe}
              onComplete={handleSwipeComplete}
              players={players}
              playerId={playerId}
            />
          </ScreenTransition>
        )}

        {screen === screens.RESULTS && (
          <ScreenTransition screenKey="results">
            <Results
              matches={matches}
              allRestaurants={filteredRestaurants}
              myChoices={myChoices}
              onSpin={handleGoToSpin}
              onRestart={handleRestart}
            />
          </ScreenTransition>
        )}

        {screen === screens.SPIN && (
          <ScreenTransition screenKey="spin">
            <SpinWheel
              matches={matches}
              onRestart={handleRestart}
            />
          </ScreenTransition>
        )}
      </AnimatePresence>
    </div>
  )
}
