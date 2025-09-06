"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Routine } from "@/types"
import { useReliabilityScore } from "@/hooks/use-reliability-score"
import { getRoutineCompletionContext, generateReliabilityReason } from "@/utils/reliability-helpers"
import { db } from "@/lib/firebase"
import { routineConverter } from "@/lib/converters"
import { collection, doc, onSnapshot, query, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

export function useRoutineOperations() {
  const { user } = useAuth()
  const { updateReliabilityScore } = useReliabilityScore()

  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  const routinesCol = useMemo(
    () => (user ? collection(db, "users", user.uid, "routines").withConverter(routineConverter) : null),
    [user],
  )

  useEffect(() => {
    if (!user || !routinesCol) {
      setRoutines([])
      setLoading(false)
      return
    }
    const unsub = onSnapshot(query(routinesCol), (snap) => {
      const next: Routine[] = []
      snap.forEach((d) => next.push(d.data()))
      setRoutines(next)
      setLoading(false)
    })
    return () => unsub()
  }, [user, routinesCol])

  const addRoutine = useCallback(
    async (name: string, type: Routine["type"]) => {
      if (!user || !routinesCol) return
      const id = doc(routinesCol).id
      const payload: Routine = {
        id,
        name,
        type,
        createdAt: new Date(),
        streak: 0,
        maxStreak: 0,
        completedDates: [],
      }
      await setDoc(doc(routinesCol, id), payload)
    },
    [user, routinesCol],
  )

  const updateRoutine = useCallback(
    async (id: string, updates: Partial<Routine>) => {
      if (!user || !routinesCol) return
      const toUpdate: Record<string, any> = { ...updates }
      // filter out id field
      delete toUpdate.id
      await updateDoc(doc(routinesCol, id), toUpdate)
    },
    [user, routinesCol],
  )

  const deleteRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return
      await deleteDoc(doc(routinesCol, id))
    },
    [user, routinesCol],
  )

  const toggleRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return
      const current = routines.find((r) => r.id === id)
      if (!current) return
      const today = new Date().toISOString().split("T")[0]
      const isCompletedToday = current.completedDates.includes(today)

      const context = getRoutineCompletionContext(current)
      if (isCompletedToday) {
        const action = "miss_routine"
        const reason = generateReliabilityReason(action, current.name, context)
        updateReliabilityScore(action, reason, context)

        const newDates = current.completedDates.filter((d) => d !== today)
        await updateDoc(doc(routinesCol, id), {
          completedDates: newDates,
          streak: Math.max(0, current.streak - 1),
        })
      } else {
        const action = "complete_routine"
        const reason = generateReliabilityReason(action, current.name, context)
        updateReliabilityScore(action, reason, context)

        const newStreak = current.streak + 1
        await updateDoc(doc(routinesCol, id), {
          completedDates: [...current.completedDates, today],
          streak: newStreak,
          maxStreak: Math.max(current.maxStreak, newStreak),
        })
      }
    },
    [user, routinesCol, routines, updateReliabilityScore],
  )

  const stopRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return
      const current = routines.find((r) => r.id === id)
      if (current) {
        const context = getRoutineCompletionContext(current)
        const reason = generateReliabilityReason("break_streak", current.name, context)
        updateReliabilityScore("break_streak", reason, context)
      }
      await updateDoc(doc(routinesCol, id), { stopped: true })
      toast({ title: "Routine stopped" })
    },
    [user, routinesCol, routines, updateReliabilityScore],
  )

  const pauseRoutine = useCallback(
    async (id: string) => {
      if (!user || !routinesCol) return
      await updateDoc(doc(routinesCol, id), { paused: true })
      toast({ title: "Routine paused" })
    },
    [user, routinesCol],
  )

  return { routines, loading, addRoutine, updateRoutine, deleteRoutine, toggleRoutine, stopRoutine, pauseRoutine }
}
