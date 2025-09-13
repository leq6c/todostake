"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { UserProfile } from "@/types"
import { db } from "@/lib/firebase"
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { Capacitor } from "@capacitor/core"
import { FirebaseFirestore } from "@capacitor-firebase/firestore"

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

    if (Capacitor.isNativePlatform()) {
      let listenerId: string | null = null
      void FirebaseFirestore.addDocumentSnapshotListener(
        { reference: ref.path },
        (event) => {
          const snap = event?.snapshot
          if (snap?.data) {
            setProfile(snap.data as UserProfile)
          } else {
            const initial: UserProfile = {
              name: user.displayName || "User",
              email: user.email || "",
              reliabilityScore: 87,
              reliabilityHistory: [],
              walletConnected: false,
              floatingWindowMode: true,
            }
            void FirebaseFirestore.setDocument({ reference: ref.path, data: initial, options: { merge: true } as any })
            setProfile(initial)
          }
          setLoading(false)
        },
      ).then((id) => (listenerId = id))

      return () => {
        if (listenerId) void FirebaseFirestore.removeSnapshotListener({ id: listenerId })
      }
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
      if (Capacitor.isNativePlatform()) {
        await FirebaseFirestore.updateDocument({ reference: ref.path, data: updates as any })
      } else {
        await updateDoc(ref, updates as any)
      }
    },
    [ref],
  )

  return { profile, loading, updateProfile }
}
