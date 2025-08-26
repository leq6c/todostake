"use client"

import { useState, useCallback } from "react"
import type { ReliabilityEntry } from "@/types"

export function useReliabilityScore() {
  const [reliabilityHistory, setReliabilityHistory] = useState<ReliabilityEntry[]>([
    {
      date: "2025-08-20",
      score: 85,
      change: -2,
      reason: "Missed routine: Morning Exercise",
    },
    {
      date: "2025-08-21",
      score: 87,
      change: +2,
      reason: "Completed all daily tasks",
    },
    {
      date: "2025-08-22",
      score: 89,
      change: +2,
      reason: "Maintained streak: Meditate",
    },
    {
      date: "2025-08-23",
      score: 87,
      change: -2,
      reason: "Late completion: Review quarterly reports",
    },
    {
      date: "2025-08-24",
      score: 90,
      change: +3,
      reason: "Perfect day: All tasks and routines completed",
    },
    {
      date: "2025-08-25",
      score: 87,
      change: -3,
      reason: "Missed deadline: Prepare presentation slides",
    },
  ])

  const [currentScore, setCurrentScore] = useState(87)

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
    (
      action: "complete_task" | "miss_task" | "complete_routine" | "miss_routine" | "break_streak",
      reason: string,
      context?: { hasStake?: boolean; isOverdue?: boolean; streakLength?: number },
    ) => {
      const change = calculateScoreChange(action, context)
      const newScore = Math.max(0, Math.min(100, currentScore + change))

      const newEntry: ReliabilityEntry = {
        date: new Date().toISOString().split("T")[0],
        score: newScore,
        change,
        reason,
      }

      setCurrentScore(newScore)
      setReliabilityHistory((prev) => [newEntry, ...prev.slice(0, 29)]) // Keep last 30 entries
    },
    [currentScore, calculateScoreChange],
  )

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
  }
}
