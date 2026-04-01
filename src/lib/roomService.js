import { db } from './firebase'
import {
  ref,
  set,
  get,
  update,
  onValue,
  onDisconnect,
  serverTimestamp,
  remove,
} from 'firebase/database'

// Generate a short random player ID
function generatePlayerId() {
  return Math.random().toString(36).substring(2, 10)
}

// Generate a 5-char room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Get or create a persistent player ID in sessionStorage
export function getPlayerId() {
  let id = sessionStorage.getItem('eatwhat_player_id')
  if (!id) {
    id = generatePlayerId()
    sessionStorage.setItem('eatwhat_player_id', id)
  }
  return id
}

/**
 * Create a new room in Firebase
 * Room structure:
 * rooms/{code}/
 *   config: { location, budgets[], people, restaurantIds[], createdAt }
 *   players/
 *     {playerId}: { joinedAt, ready, choices: { restaurantId: 'yum'|'nope' } }
 *   status: 'waiting' | 'swiping' | 'results'
 */
export async function createRoom(config, restaurantIds) {
  const code = generateRoomCode()
  const playerId = getPlayerId()
  const roomRef = ref(db, `rooms/${code}`)

  await set(roomRef, {
    config: {
      location: config.location,
      budgets: config.budgets,
      people: config.people,
      restaurantIds,
      createdAt: Date.now(),
    },
    status: 'waiting',
    players: {
      [playerId]: {
        joinedAt: Date.now(),
        ready: false,
        isHost: true,
        choices: {},
      },
    },
  })

  // Clean up room on host disconnect (after 5 min of inactivity)
  const playerRef = ref(db, `rooms/${code}/players/${playerId}`)
  onDisconnect(playerRef).update({ disconnected: true })

  return { code, playerId }
}

/**
 * Join an existing room
 */
export async function joinRoom(code) {
  const playerId = getPlayerId()
  const roomRef = ref(db, `rooms/${code}`)

  const snapshot = await get(roomRef)
  if (!snapshot.exists()) {
    throw new Error('房間不存在')
  }

  const room = snapshot.val()
  const playerCount = room.players ? Object.keys(room.players).length : 0

  if (playerCount >= room.config.people) {
    throw new Error('房間已滿')
  }

  if (room.status !== 'waiting') {
    throw new Error('配對已開始，無法加入')
  }

  // Add player to room
  const playerRef = ref(db, `rooms/${code}/players/${playerId}`)
  await set(playerRef, {
    joinedAt: Date.now(),
    ready: false,
    isHost: false,
    choices: {},
  })

  onDisconnect(playerRef).update({ disconnected: true })

  return { code, playerId, config: room.config }
}

/**
 * Start the swiping phase (host only)
 */
export async function startSwiping(code) {
  await update(ref(db, `rooms/${code}`), { status: 'swiping' })
}

/**
 * Submit a single swipe choice
 */
export async function submitChoice(code, playerId, restaurantId, choice) {
  await update(ref(db, `rooms/${code}/players/${playerId}/choices`), {
    [restaurantId]: choice,
  })
}

/**
 * Mark player as done swiping
 */
export async function markReady(code, playerId) {
  await update(ref(db, `rooms/${code}/players/${playerId}`), { ready: true })
}

/**
 * Move room to results phase
 */
export async function goToResults(code) {
  await update(ref(db, `rooms/${code}`), { status: 'results' })
}

/**
 * Listen to room changes in real-time
 * Returns an unsubscribe function
 */
export function onRoomChange(code, callback) {
  const roomRef = ref(db, `rooms/${code}`)
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

/**
 * Listen to players in a room
 */
export function onPlayersChange(code, callback) {
  const playersRef = ref(db, `rooms/${code}/players`)
  return onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

/**
 * Calculate matches from all players' choices
 */
export function calculateMatches(players, restaurants) {
  const playerIds = Object.keys(players)
  return restaurants.filter((r) => {
    return playerIds.every((pid) => {
      const choices = players[pid].choices || {}
      return choices[r.id] === 'yum'
    })
  })
}

/**
 * Check if all players have finished swiping
 */
export function allPlayersReady(players) {
  return Object.values(players).every((p) => p.ready)
}

/**
 * Clean up a room
 */
export async function deleteRoom(code) {
  await remove(ref(db, `rooms/${code}`))
}
