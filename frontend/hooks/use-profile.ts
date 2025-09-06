"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { UserProfile } from "@/types"
import { db } from "@/lib/firebase"
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const ref = useMemo(() => (user ? doc(db, "users", user.uid, "profile", "main") : null), [user])

  useEffect(() => {
    if (!user || !ref) {
      setProfile(null)
      setLoading(false)
      return
    }
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile)
      } else {
        // Initialize a default profile
        const initial: UserProfile = {
          name: user.displayName || "User",
          email: user.email || "",
          reliabilityScore: 87,
          reliabilityHistory: [],
          walletConnected: false,
          floatingWindowMode: true,
        }
        void setDoc(ref, initial, { merge: true })
        setProfile(initial)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [user, ref])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!ref) return
      await updateDoc(ref, updates as any)
    },
    [ref],
  )

  return { profile, loading, updateProfile }
}
