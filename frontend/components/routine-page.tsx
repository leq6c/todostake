"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeBadge } from "@/components/ui/stake-badge"
import { StreakVisualization } from "@/components/ui/streak-visualization"
import { MobileHeader } from "@/components/ui/mobile-header"
import type { StreakData } from "@/types"

interface RoutineTask {
  id: string
  name: string
  streak: number
  maxStreak: number
  completedDates: string[]
  lastCompleted?: string
  description?: string
  stakeAmount?: number
  stopped?: boolean
  paused?: boolean
  maxAbsence?: number
}

interface RoutinePageProps {
  type: "daily" | "weekly" | "monthly"
  selectedRoutineId?: string
  onSelectRoutine: (id: string | null) => void
  onMenuClick?: () => void
}

export function RoutinePage({ type, selectedRoutineId, onSelectRoutine, onMenuClick }: RoutinePageProps) {
  const [routines, setRoutines] = useState<RoutineTask[]>([
    {
      id: "1",
      name: "Morning Exercise",
      streak: 7,
      maxStreak: 12,
      completedDates: [
        "2025-08-14",
        "2025-08-15",
        "2025-08-16",
        "2025-08-17",
        "2025-08-19",
        "2025-08-20",
        "2025-08-21",
        "2025-08-22",
        "2025-08-24",
      ],
      lastCompleted: "2025-08-24",
      description: "30 minutes of cardio and strength training",
      stakeAmount: 50,
    },
    {
      id: "2",
      name: "Read 30 minutes",
      streak: 3,
      maxStreak: 8,
      completedDates: [
        "2025-08-10",
        "2025-08-11",
        "2025-08-14",
        "2025-08-15",
        "2025-08-16",
        "2025-08-18",
        "2025-08-21",
        "2025-08-23",
        "2025-08-24",
      ],
      lastCompleted: "2025-08-24",
      description: "Read books or articles for personal development",
      stakeAmount: 25,
    },
    {
      id: "3",
      name: "Meditate",
      streak: 0,
      maxStreak: 5,
      completedDates: ["2025-08-05", "2025-08-06", "2025-08-08", "2025-08-15"],
      description: "10 minutes of mindfulness meditation",
      maxAbsence: 3,
    },
    {
      id: "4",
      name: "Drink 8 glasses of water",
      streak: 14,
      maxStreak: 14,
      completedDates: [
        "2025-08-11",
        "2025-08-12",
        "2025-08-13",
        "2025-08-14",
        "2025-08-15",
        "2025-08-16",
        "2025-08-17",
        "2025-08-18",
        "2025-08-19",
        "2025-08-20",
        "2025-08-21",
        "2025-08-22",
        "2025-08-23",
        "2025-08-24",
      ],
      lastCompleted: "2025-08-24",
      description: "Stay hydrated throughout the day",
      stakeAmount: 100,
    },
    {
      id: "5",
      name: "Learn Spanish",
      streak: 0,
      maxStreak: 15,
      completedDates: ["2025-07-10", "2025-07-11", "2025-07-12"],
      lastCompleted: "2025-07-12",
      description: "Practice Spanish for 20 minutes daily",
      stopped: true,
      stakeAmount: 30,
    },
  ])

  const [newRoutineName, setNewRoutineName] = useState("")
  const [showStoppedRoutines, setShowStoppedRoutines] = useState(false)

  const addRoutine = () => {
    if (newRoutineName.trim()) {
      const newRoutine: RoutineTask = {
        id: Date.now().toString(),
        name: newRoutineName.trim(),
        streak: 0,
        maxStreak: 0,
        completedDates: [],
      }
      setRoutines([...routines, newRoutine])
      setNewRoutineName("")
    }
  }

  const toggleRoutine = (id: string) => {
    const today = new Date().toISOString().split("T")[0]
    setRoutines(
      routines.map((routine) => {
        if (routine.id === id) {
          const isCompletedToday = routine.completedDates.includes(today)
          if (isCompletedToday) {
            return {
              ...routine,
              streak: Math.max(0, routine.streak - 1),
              completedDates: routine.completedDates.filter((date) => date !== today),
              lastCompleted:
                routine.completedDates.length > 1
                  ? routine.completedDates[routine.completedDates.length - 2]
                  : undefined,
            }
          } else {
            const newStreak = routine.streak + 1
            return {
              ...routine,
              streak: newStreak,
              maxStreak: Math.max(routine.maxStreak, newStreak),
              completedDates: [...routine.completedDates, today],
              lastCompleted: today,
            }
          }
        }
        return routine
      }),
    )
  }

  const updateRoutine = (id: string, updates: Partial<RoutineTask>) => {
    setRoutines(routines.map((routine) => (routine.id === id ? { ...routine, ...updates } : routine)))
  }

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter((routine) => routine.id !== id))
    if (selectedRoutineId === id) {
      onSelectRoutine(null)
    }
  }

  const stopRoutine = (id: string) => {
    setRoutines(routines.map((routine) => (routine.id === id ? { ...routine, stopped: true } : routine)))
  }

  const pauseRoutine = (id: string) => {
    setRoutines(routines.map((routine) => (routine.id === id ? { ...routine, paused: true } : routine)))
  }

  const getStreakColor = (streak: number, maxStreak: number) => {
    if (streak === 0) return "bg-muted"
    const intensity = Math.min(streak / Math.max(maxStreak, 1), 1)
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900"
    if (intensity < 0.5) return "bg-green-300 dark:bg-green-800"
    if (intensity < 0.75) return "bg-green-400 dark:bg-green-700"
    return "bg-green-500 dark:bg-green-600"
  }

  const calculateAbsenceStreak = (routine: RoutineTask) => {
    if (!routine.completedDates.length) return 0

    const today = new Date()
    let absenceCount = 0

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      if (routine.completedDates.includes(dateString)) {
        break
      }
      absenceCount++
    }

    return absenceCount
  }

  const generateStreakData = (routine: RoutineTask): StreakData[] => {
    const data: StreakData[] = []
    const today = new Date()
    const daysToShow = type === "daily" ? 30 : type === "weekly" ? 12 : 6

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      if (type === "daily") {
        date.setDate(date.getDate() - i)
      } else if (type === "weekly") {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }

      const dateString = date.toISOString().split("T")[0]
      const isCompleted = routine.completedDates.includes(dateString)

      data.push({ date: dateString, completed: isCompleted })
    }
    return data
  }

  const RoutineItem = ({ routine, isStopped = false }: { routine: RoutineTask; isStopped?: boolean }) => {
    const isCompletedToday = routine.completedDates.includes(today)
    const isSelected = selectedRoutineId === routine.id
    const currentAbsence = calculateAbsenceStreak(routine)
    const isMaxAbsenceExceeded = routine.maxAbsence && currentAbsence >= routine.maxAbsence
    const streakData = generateStreakData(routine)

    return (
      <div
        className={`border rounded-lg py-1.5 px-2 hover:bg-muted/50 transition-colors cursor-pointer ${
          isStopped ? "opacity-60" : ""
        } ${isSelected ? "border-foreground/20 bg-muted/30" : "border-border"}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelectRoutine(routine.id)
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CircularCheckbox
              checked={isCompletedToday}
              onClick={(e) => {
                e.stopPropagation()
                if (!isStopped) toggleRoutine(routine.id)
              }}
              variant={isMaxAbsenceExceeded ? "danger" : "default"}
              className={isStopped ? "opacity-40" : ""}
            />
            <span className={`text-sm font-medium ${isStopped ? "line-through" : ""}`}>{routine.name}</span>
            {routine.stakeAmount && (
              <StakeBadge amount={routine.stakeAmount} variant={isStopped ? "danger" : "success"} />
            )}
            {isMaxAbsenceExceeded && !isStopped && <AlertTriangle className="h-3 w-3 text-red-500" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {isStopped ? "Stopped" : `${routine.streak} day streak`}
            </span>
          </div>
        </div>

        <StreakVisualization streakData={streakData} maxAbsence={routine.maxAbsence} className="mb-2" />

        {routine.lastCompleted && (
          <div className="text-xs text-muted-foreground">
            Last completed: {new Date(routine.lastCompleted).toLocaleDateString()}
          </div>
        )}
      </div>
    )
  }

  const today = new Date().toISOString().split("T")[0]

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("routine-container")) {
      onSelectRoutine(null)
    }
  }

  const activeRoutines = routines.filter((routine) => !routine.stopped)
  const stoppedRoutines = routines.filter((routine) => routine.stopped)

  return (
    <div className="h-full flex flex-col" onClick={handleContainerClick}>
      <MobileHeader title={`${type.charAt(0).toUpperCase() + type.slice(1)} Routines`} onMenuClick={onMenuClick} />

      <PageHeader title={`${type.charAt(0).toUpperCase() + type.slice(1)} Routines`} />

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 routine-container" onClick={handleContainerClick}>
        {activeRoutines.map((routine) => (
          <RoutineItem key={routine.id} routine={routine} />
        ))}

        {stoppedRoutines.length > 0 && (
          <CollapsibleSection title="Stopped Routines" count={stoppedRoutines.length}>
            {stoppedRoutines.map((routine) => (
              <RoutineItem key={routine.id} routine={routine} isStopped />
            ))}
          </CollapsibleSection>
        )}
      </div>

      <div className="p-3 pt-0 bg-background/95 backdrop-blur-sm">
        <div className="w-full">
          <div className="flex gap-3">
            <div className="flex-1 relative rounded border-1 dark:border-none">
              <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Add a new routine..."
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addRoutine()
                  }
                }}
                className="pl-11 h-12 text-base border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
