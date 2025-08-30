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
          createdAt: serverTimestamp(),
        })
      })
    },
    [user, currentRef, historyCol, calculateScoreChange],
  )

  const resetMetrics = useCallback(async () => {
    if (!user || !currentRef || !historyCol) return
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
