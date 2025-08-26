"use client"

import { useState } from "react"
import type { Routine } from "@/types"
import { useReliabilityScore } from "@/hooks/use-reliability-score"
import { getRoutineCompletionContext, generateReliabilityReason } from "@/utils/reliability-helpers"

export function useRoutineOperations() {
  const { updateReliabilityScore } = useReliabilityScore()

  const [routines, setRoutines] = useState<Routine[]>([])

  const updateRoutine = (id: string, updates: Partial<Routine>) => {
    setRoutines((prev) => prev.map((routine) => (routine.id === id ? { ...routine, ...updates } : routine)))
  }

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((routine) => routine.id !== id))
  }

  const toggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === id) {
          const today = new Date().toISOString().split("T")[0]
          const isCompletedToday = routine.completedDates.includes(today)

          const context = getRoutineCompletionContext(routine)

          if (isCompletedToday) {
            // Uncompleting routine
            const action = "miss_routine"
            const reason = generateReliabilityReason(action, routine.name, context)
            updateReliabilityScore(action, reason, context)

            return {
              ...routine,
              streak: Math.max(0, routine.streak - 1),
              completedDates: routine.completedDates.filter((date) => date !== today),
            }
          } else {
            // Completing routine
            const action = "complete_routine"
            const reason = generateReliabilityReason(action, routine.name, context)
            updateReliabilityScore(action, reason, context)

            const newStreak = routine.streak + 1
            return {
              ...routine,
              streak: newStreak,
              maxStreak: Math.max(routine.maxStreak, newStreak),
              completedDates: [...routine.completedDates, today],
            }
          }
        }
        return routine
      }),
    )
  }

  const stopRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((routine) => {
        if (routine.id === id) {
          const context = getRoutineCompletionContext(routine)
          const reason = generateReliabilityReason("break_streak", routine.name, context)
          updateReliabilityScore("break_streak", reason, context)

          return { ...routine, stopped: true }
        }
        return routine
      }),
    )
  }

  const pauseRoutine = (id: string) => {
    setRoutines((prev) => prev.map((routine) => (routine.id === id ? { ...routine, paused: true } : routine)))
  }

  return {
    routines,
    updateRoutine,
    deleteRoutine,
    toggleRoutine,
    stopRoutine,
    pauseRoutine,
  }
}
