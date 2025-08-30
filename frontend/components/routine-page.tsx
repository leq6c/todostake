"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeBadge } from "@/components/ui/stake-badge"
import { StreakVisualization } from "@/components/ui/streak-visualization"
import { MobileHeader } from "@/components/ui/mobile-header"
import type { StreakData, Routine } from "@/types"
import { useRoutineOperations } from "@/hooks/use-routine-operations"
import { Skeleton } from "@/components/ui/skeleton"

// Uses shared Routine type backed by Firestore

interface RoutinePageProps {
  type: "daily" | "weekly" | "monthly"
  selectedRoutineId?: string
  onSelectRoutine: (id: string | null) => void
  onMenuClick?: () => void
}

export function RoutinePage({ type, selectedRoutineId, onSelectRoutine, onMenuClick }: RoutinePageProps) {
  const { routines, addRoutine, toggleRoutine, loading } = useRoutineOperations()

  const [newRoutineName, setNewRoutineName] = useState("")
  const [showStoppedRoutines, setShowStoppedRoutines] = useState(false)

  const handleAddRoutine = () => {
    if (newRoutineName.trim()) {
      addRoutine(newRoutineName.trim(), type)
      setNewRoutineName("")
    }
  }

  // toggling handled by hook

  // updates, delete, stop/pause are handled by detail panel via hook; this page reads and toggles only

  const getStreakColor = (streak: number, maxStreak: number) => {
    if (streak === 0) return "bg-muted"
    const intensity = Math.min(streak / Math.max(maxStreak, 1), 1)
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900"
    if (intensity < 0.5) return "bg-green-300 dark:bg-green-800"
    if (intensity < 0.75) return "bg-green-400 dark:bg-green-700"
    return "bg-green-500 dark:bg-green-600"
  }

  const calculateAbsenceStreak = (routine: Routine) => {
    const start = routine.createdAt ? new Date(routine.createdAt) : new Date()
    const today = new Date()
    let absenceCount = 0
    for (let i = 0; ; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      if (date < start) break
      const dateString = date.toISOString().split("T")[0]
      if (routine.completedDates.includes(dateString)) break
      absenceCount++
    }
    return absenceCount
  }

  const generateStreakData = (routine: Routine): StreakData[] => {
    const data: StreakData[] = []
    const today = new Date()
    const daysToShow = type === "daily" ? 30 : type === "weekly" ? 12 : 6
    const start = routine.createdAt ? new Date(routine.createdAt) : new Date(today)

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      if (type === "daily") {
        date.setDate(date.getDate() - i)
      } else if (type === "weekly") {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }
      // Always render a full window for design; absence logic uses createdAt separately
      const dateString = date.toISOString().split("T")[0]
      const isCompleted = routine.completedDates.includes(dateString)

      data.push({ date: dateString, completed: isCompleted })
    }
    return data
  }

  const RoutineItem = ({ routine }: { routine: Routine }) => {
    const isCompletedToday = routine.completedDates.includes(today)
    const isSelected = selectedRoutineId === routine.id
    const currentAbsence = calculateAbsenceStreak(routine)
    const daysSinceStart = (() => {
      const start = routine.createdAt ? new Date(routine.createdAt) : new Date()
      const t = new Date()
      const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const todayOnly = new Date(t.getFullYear(), t.getMonth(), t.getDate())
      return Math.max(0, Math.floor((todayOnly.getTime() - startOnly.getTime()) / (1000 * 60 * 60 * 24)))
    })()
    const canExceed = typeof routine.maxAbsence === "number" ? daysSinceStart > routine.maxAbsence : false
    const isMaxAbsenceExceeded = !!routine.maxAbsence && canExceed && currentAbsence >= routine.maxAbsence
    const streakData = generateStreakData(routine)

    const isInactive = !!routine.stopped || !!routine.paused
    return (
      <div
        className={`border rounded-lg py-1.5 px-2 hover:bg-muted/50 transition-colors cursor-pointer ${
          isInactive ? "opacity-60" : ""
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
                if (!isInactive) toggleRoutine(routine.id)
              }}
              variant={isMaxAbsenceExceeded ? "danger" : "default"}
              className={isInactive ? "opacity-40" : ""}
            />
            <span className={`text-sm font-medium ${isInactive ? "line-through" : ""}`}>{routine.name}</span>
            {routine.stakeAmount && (
              <StakeBadge amount={routine.stakeAmount} variant={isInactive ? "danger" : "success"} />
            )}
            {isMaxAbsenceExceeded && !isInactive && <AlertTriangle className="h-3 w-3 text-red-500" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {routine.stopped ? "Stopped" : routine.paused ? "Paused" : `${routine.streak} day streak`}
            </span>
          </div>
        </div>

        <StreakVisualization streakData={streakData} maxAbsence={routine.maxAbsence} className="mb-2" />

        {routine.completedDates.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Last completed: {new Date(routine.completedDates[routine.completedDates.length - 1]).toLocaleDateString()}
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

  const routinesOfType: Routine[] = useMemo(() => routines.filter((r) => r.type === type), [routines, type])
  const activeRoutines = routinesOfType.filter((routine) => !routine.stopped && !routine.paused)
  const inactiveRoutines = routinesOfType.filter((routine) => routine.stopped || routine.paused)

  return (
    <div className="h-full flex flex-col" onClick={handleContainerClick}>
      <MobileHeader title={`${type.charAt(0).toUpperCase() + type.slice(1)} Routines`} onMenuClick={onMenuClick} />

      <PageHeader title={`${type.charAt(0).toUpperCase() + type.slice(1)} Routines`} />

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 routine-container" onClick={handleContainerClick}>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        )}
        {activeRoutines.map((routine) => (
          <RoutineItem key={routine.id} routine={routine} />
        ))}

        {inactiveRoutines.length > 0 && (
          <CollapsibleSection title="Paused/Stopped" count={inactiveRoutines.length}>
            {inactiveRoutines.map((routine) => (
              <RoutineItem key={routine.id} routine={routine} />
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
                    handleAddRoutine()
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
