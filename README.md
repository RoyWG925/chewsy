# Chewsy 🍜 — Group Restaurant Decision App

> *"Stop arguing. Just swipe and you'll know."*
> 
> A Tinder-style group voting app that ends the eternal "where should we eat?" debate.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-ffca28?logo=firebase)](https://firebase.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-animation-e36bff)](https://www.framer.com/motion/)
[![Solo Project](https://img.shields.io/badge/Solo%20Project-✓-brightgreen)](.)

**→ [Live Demo](https://chewsy-51ce4.web.app/)**

---

## What Is This?

Chewsy is a **real-time multiplayer web app** that solves group decision paralysis for restaurant choices. Friends join the same room, swipe on restaurants like Tinder, and the app surfaces the ones everyone agreed on. If there are multiple matches, a spin wheel decides.

Built solo with React 18, Firebase Realtime Database for live sync, and Framer Motion for swipe animations.

---

## Core Flow

```
Host creates room → Shares QR Code or 5-digit room code
  → Everyone joins → Swipe cards (← no / → yes)
    → System finds mutual matches → Spin wheel if tie
      → Your dinner is decided. No more arguing.
```

---

## Features

- **Swipe Interface** — Tinder-style card swiping with physics-feel Framer Motion animations
- **Real-time Sync** — Firebase Realtime Database keeps all players in sync with zero delay
- **Smart Matching** — Auto-computes intersection of all players' yes votes
- **Spin Wheel** — Randomized decision for tied matches (animated, satisfying)
- **Room System** — 5-digit codes + QR Code for quick invite
- **Filter System** — Filter by location and price range before the session starts
- **Anonymous Auth** — Firebase anonymous auth, no sign-up required

---

## Technical Architecture

### Stack
| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Backend / Database | Firebase Realtime Database |
| Auth | Firebase Anonymous Auth |
| Hosting | Firebase Hosting |
| QR Code | `qrcode.react` |

### Real-Time State Design
```
Firebase DB Schema:
rooms/
  {roomId}/
    ├── config/          ← location, priceRange, maxPlayers
    ├── players/         ← player list & ready status
    ├── votes/           ← {userId} → {restaurantId} → bool
    └── status/          ← "waiting" | "swiping" | "results"
```

All state changes propagate instantly to all connected clients via Firebase `onValue` listeners — no polling, no refresh needed.

### Component Map
```
src/
├── components/
│   ├── Landing.jsx      ← Entry point (create or join room)
│   ├── Setup.jsx        ← Room config (location, price, player count)
│   ├── WaitingRoom.jsx  ← Lobby with QR code share
│   ├── SwipeSession.jsx ← Swipe interface coordinator
│   ├── SwipeCard.jsx    ← Individual draggable card
│   ├── Results.jsx      ← Match display & result screen
│   └── SpinWheel.jsx    ← Animated spin wheel for tiebreaking
├── lib/
│   ├── firebase.js      ← Firebase config & initialization
│   └── roomService.js   ← Room lifecycle logic (create/join/sync/close)
└── data/
    ├── restaurants.json ← Restaurant dataset with images & metadata
    └── locations.json   ← Available filter locations
```

---

## Running Locally

**Requirements:** Node.js 16+, a Firebase project (free tier works fine)

```bash
# 1. Clone & install
git clone <repo-url>
cd chewsy
npm install

# 2. Configure Firebase
cp .env.example .env
# Fill in your Firebase project credentials in .env

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

### Firebase Setup (5 min)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database** and **Anonymous Authentication**
3. Copy your config values into `.env`:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

### Adding Restaurants
Edit `src/data/restaurants.json`:
```json
{
  "id": "unique-id",
  "name": "Restaurant Name",
  "location": "Taipei",
  "priceRange": "$$",
  "cuisine": "Japanese",
  "image": "https://...",
  "description": "Short description"
}
```

---

## Deploy

```bash
npm run build
firebase deploy
```

---

*Built with ❤️ and 🍜 by Roy Wang*
