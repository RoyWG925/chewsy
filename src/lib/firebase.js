import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB-RYPck4IfwrumWxEpuKr497zMJIMNTnc",
  authDomain: "chewsy-51ce4.firebaseapp.com",
  databaseURL: "https://chewsy-51ce4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chewsy-51ce4",
  storageBucket: "chewsy-51ce4.firebasestorage.app",
  messagingSenderId: "560855165113",
  appId: "1:560855165113:web:a46d7087dd0b3a4c27d368"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

// Sign in anonymously and return a promise that resolves with the uid
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      return resolve(auth.currentUser.uid)
    }
    signInAnonymously(auth)
      .then((cred) => resolve(cred.user.uid))
      .catch(reject)
  })
}

// Listen for auth state changes
export function onAuthReady(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? user.uid : null)
  })
}
