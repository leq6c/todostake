"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import type { ReliabilityEntry } from "@/types"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  addDoc,
  limit,
  writeBatch,
} from "firebase/firestore"
import { Capacitor } from "@capacitor/core"
import { FirebaseFirestore } from "@capacitor-firebase/firestore"

export function useReliabilityScore() {
  const { user } = useAuth()
  const [reliabilityHistory, setReliabilityHistory] = useState<ReliabilityEntry[]>([])
  const [currentScore, setCurrentScore] = useState(87)

  const currentRef = useMemo(() => (user ? doc(db, "users", user.uid, "metrics", "current") : null), [user])
  const historyCol = useMemo(
    () => (user ? collection(db, "users", user.uid, "metrics", "current", "history") : null),
    [user],
  )

  useEffect(() => {
    if (!user || !currentRef || !historyCol) {
      setReliabilityHistory([])
      setCurrentScore(87)
      return
    }

    if (Capacitor.isNativePlatform()) {
      // Ensure current doc exists
      void FirebaseFirestore.getDocument({ reference: currentRef.path }).then(async (res) => {
        if (!res.snapshot.data) {
          await FirebaseFirestore.setDocument({
            reference: currentRef.path,
            data: { score: 87, updatedAt: new Date() },
          })
        }
      })

      let currentListenerId: string | null = null
      let historyListenerId: string | null = null

      void FirebaseFirestore.addDocumentSnapshotListener(
        { reference: currentRef.path },
        (event) => {
          const score = (event?.snapshot?.data as any)?.score
          if (typeof score === "number") setCurrentScore(score)
        },
      ).then((id) => (currentListenerId = id))

      void FirebaseFirestore.addCollectionSnapshotListener(
        {
          reference: historyCol.path,
          queryConstraints: [
            { type: "orderBy", fieldPath: "createdAt", directionStr: "desc" },
            { type: "limit", limit: 180 },
          ] as any,
        },
        (event) => {
          const list: ReliabilityEntry[] = []
          for (const s of event?.snapshots ?? []) {
            const data = (s.data ?? {}) as any
            list.push({ date: data.date, score: data.score, change: data.change, reason: data.reason })
          }
          setReliabilityHistory(list)
        },
      ).then((id) => (historyListenerId = id))

      return () => {
        if (currentListenerId) void FirebaseFirestore.removeSnapshotListener({ id: currentListenerId })
        if (historyListenerId) void FirebaseFirestore.removeSnapshotListener({ id: historyListenerId })
      }
    }

    // Web fallback
    // Ensure current doc exists
    getDoc(currentRef).then(async (snap) => {
      if (!snap.exists()) {
        await setDoc(currentRef, { score: 87, updatedAt: serverTimestamp() })
      }
    })

    const unsubCurrent = onSnapshot(currentRef, (snap) => {
      const score = (snap.data() as any)?.score
      if (typeof score === "number") setCurrentScore(score)
    })

    // pull last 180 entries by createdAt desc
    const q = query(historyCol, orderBy("createdAt", "desc"), limit(180))
    const unsubHistory = onSnapshot(q, (snap) => {
      const list: ReliabilityEntry[] = []
      snap.forEach((d) => {
        const data = d.data() as any
        list.push({ date: data.date, score: data.score, change: data.change, reason: data.reason })
      })
      setReliabilityHistory(list)
    })

    return () => {
      unsubCurrent()
      unsubHistory()
    }
  }, [user, currentRef, historyCol])

  const calculateScoreChange = useCallback(
    (
      action: "complete_task" | "miss_task" | "complete_routine" | "miss_routine" | "break_streak",
      context?: { hasStake?: boolean; isOverdue?: boolean; streakLength?: number },
    ): number => {
      const basePoints = {
        complete_task: 2,
        miss_task: -3,
        complete_routine: 3,
        miss_routine: -4,
        break_streak: -5,
      }

      let change = basePoints[action]

      if (context?.hasStake) {
        change = Math.abs(change) * 1.5 * (change > 0 ? 1 : -1) // 50% bonus/penalty for staked items
      }

      if (context?.isOverdue && action === "complete_task") {
        change = Math.max(1, change - 1) // Reduced points for late completion
      }

      if (context?.streakLength && context.streakLength > 7) {
        change += 1 // Bonus for maintaining long streaks
      }

      return Math.round(change)
    },
    [],
  )

  const updateReliabilityScore = useCallback(
    async (
      action: "complete_task" | "miss_task" | "complete_routine" | "miss_routine" | "break_streak",
      reason: string,
      context?: { hasStake?: boolean; isOverdue?: boolean; streakLength?: number },
    ) => {
      if (!user || !currentRef || !historyCol) return
      const change = calculateScoreChange(action, context)
      const dateStr = new Date().toISOString().split("T")[0]

      if (Capacitor.isNativePlatform()) {
        // Emulate transaction with get + batch
        const current = await FirebaseFirestore.getDocument({ reference: currentRef.path })
        const prevScore = ((current.snapshot.data as any)?.score ?? 87) as number
        const newScore = Math.max(0, Math.min(100, prevScore + change))
        const historyId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
        await FirebaseFirestore.writeBatch({
          operations: [
            {
              type: "set",
              reference: currentRef.path,
              data: { score: newScore, updatedAt: new Date() },
              options: { merge: true } as any,
            },
            {
              type: "set",
              reference: `${historyCol.path}/${historyId}`,
              data: {
                date: dateStr,
                score: newScore,
                change,
                reason,
                createdAt: Date.now(),
              },
            },
          ],
        })
        return
      }

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(currentRef)
        const prevScore = (snap.exists() ? (snap.data() as any).score : 87) as number
        const newScore = Math.max(0, Math.min(100, prevScore + change))
        tx.set(currentRef, { score: newScore, updatedAt: serverTimestamp() }, { merge: true })
        const entryRef = doc(historyCol)
        tx.set(entryRef, {
          date: dateStr,
          score: newScore,
          change,
          reason,
          createdAt: Date.now(),
        })
      })
    },
    [user, currentRef, historyCol, calculateScoreChange],
  )

  const resetMetrics = useCallback(async () => {
    if (!user || !currentRef || !historyCol) return
    if (Capacitor.isNativePlatform()) {
      const col = await FirebaseFirestore.getCollection({ reference: historyCol.path })
      const operations: any[] = []
      for (const s of col.snapshots ?? []) {
        operations.push({ type: "delete", reference: s.path })
      }
      operations.push({ type: "set", reference: currentRef.path, data: { score: 87, updatedAt: new Date() }, options: { merge: true } as any })
      if (operations.length) await FirebaseFirestore.writeBatch({ operations })
      return
    }
    const snap = await getDocs(historyCol)
    const batch = writeBatch(db)
    snap.forEach((d) => batch.delete(d.ref))
    batch.set(currentRef, { score: 87, updatedAt: serverTimestamp() }, { merge: true })
    await batch.commit()
  }, [user, currentRef, historyCol])

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }, [])

  const getScoreBadge = useCallback((score: number): string => {
    if (score >= 95) return "Exceptional"
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Very Good"
    if (score >= 70) return "Good"
    if (score >= 60) return "Fair"
    return "Needs Improvement"
  }, [])

  return {
    currentScore,
    reliabilityHistory,
    updateReliabilityScore,
    calculateScoreChange,
    getScoreColor,
    getScoreBadge,
    resetMetrics,
  }
}
