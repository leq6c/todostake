// Firebase initialization and Firestore offline persistence
// This module is only imported from client components/hooks.

import { initializeApp, getApps } from "firebase/app"
import {
  getFirestore,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

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

// Use enhanced cache for better offline support; fall back if unsupported
let db: Firestore
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} catch {
  db = getFirestore(app)
  if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch(() => {
      // Ignore persistence errors (e.g., private browsing)
    })
  }
}

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, db, auth, googleProvider }

