// src/config/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Pull and sanitize the DB URL (strip any accidental quotes/spaces)
const rawDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || ''
const cleanDbUrl = rawDbUrl.replace(/"/g, '').trim()

// Quick sanity check in the browser console
if (typeof window !== 'undefined') {
  // You can temporarily uncomment this to verify value in DevTools
  // console.log('[firebase] databaseURL =', cleanDbUrl)
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: cleanDbUrl, // important
}

const app = initializeApp(firebaseConfig)

// Pass `app` AND the sanitized URL explicitly to be extra safe
export const auth = typeof window !== "undefined" ? getAuth(app) : null
export const db = getDatabase(app, cleanDbUrl) // <— forces correct URL
export const storage = getStorage(app)

export default app
