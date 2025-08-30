"use client"

import { useEffect, useState, useCallback } from "react"
import { auth, googleProvider } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    await signInWithPopup(auth, googleProvider)
  }, [])

  const signInGuest = useCallback(async () => {
    setError(null)
    await signInAnonymously(auth)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    setError(null)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(cred.user, { displayName })
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null)
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    await sendPasswordResetEmail(auth, email)
  }, [])

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInGuest,
    signOut,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
  }
}
