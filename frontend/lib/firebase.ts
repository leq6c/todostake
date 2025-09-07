// Firebase initialization and Firestore offline persistence
// This module is only imported from client components/hooks.

import { initializeApp, getApps, SDK_VERSION } from "firebase/app"
import {
  getFirestore,
  enableIndexedDbPersistence,
  clearIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore"
import { getAuth, GoogleAuthProvider, setPersistence, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function assertConfig(cfg: Record<string, unknown>) {
  for (const [k, v] of Object.entries(cfg)) {
    if (!v || typeof v !== "string") {
      throw new Error(`Missing Firebase env var: ${k}`)
    }
  }
}

assertConfig(firebaseConfig)

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)

// If SDK version changed, attempt a one-time clear of old persisted data to prevent
// version mismatch errors (failed-precondition) and reset cache cleanly.
if (typeof window !== "undefined") {
  try {
    const key = "wb:firebase:sdk"
    const last = localStorage.getItem(key)
    if (!last || last !== SDK_VERSION) {
      // Best-effort clear; may fail if another tab is open or persistence not enabled yet.
      const temp = getFirestore(app)
      void clearIndexedDbPersistence(temp).catch(() => {})
      localStorage.setItem(key, SDK_VERSION)
    }
  } catch {}
}

// Use enhanced cache for better offline support; fall back if unsupported
let db: Firestore
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} catch {
  db = getFirestore(app)
  if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch(async (err: any) => {
      // Attempt self-heal on version mismatch by clearing old persistence then retrying once.
      if (err?.code === "failed-precondition") {
        try {
          await clearIndexedDbPersistence(db)
          await enableIndexedDbPersistence(db)
        } catch {
          // Ignore and continue with memory cache
        }
      }
      // Ignore other persistence errors (e.g., private browsing)
    })
  }
}

// Ensure Auth is persisted offline so user is restored without network
const auth = getAuth(app)
if (typeof window !== "undefined") {
  // Try IndexedDB persistence first, fall back to localStorage
  setPersistence(auth, indexedDBLocalPersistence).catch(() => {
    return setPersistence(auth, browserLocalPersistence)
  }).catch(() => {
    // Ignore if persistence cannot be set (e.g., unsupported environments)
  })
}
const googleProvider = new GoogleAuthProvider()

export { app, db, auth, googleProvider }
