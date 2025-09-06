"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Target, TrendingUp, Pause, AlertTriangle, Star, Check, Square } from "lucide-react"
import { SpeechBubbleModal } from "@/components/ui/speech-bubble-modal"
import { DetailPanelLayout } from "@/components/ui/detail-panel-layout"
import { InputWithButton } from "@/components/ui/input-with-button"
import { StatsGrid } from "@/components/ui/stats-grid"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StreakVisualization } from "@/components/ui/streak-visualization"
import { StakeSection } from "@/components/ui/stake-section"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Routine, StreakData } from "@/types"

interface RoutineDetailPanelProps {
  routine: Routine | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Routine>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onStop: (id: string) => void
  onPause: (id: string) => void
  type: "daily" | "weekly" | "monthly"
}

export function RoutineDetailPanel({
  routine,
  onClose,
  onUpdate,
  onDelete,
  onToggle,
  onStop,
  onPause,
  type,
}: RoutineDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(routine?.name || "")
  const [description, setDescription] = useState(routine?.description || "")
  const [stakeAmount, setStakeAmount] = useState("")
  const [maxAbsence, setMaxAbsence] = useState("")
  const [showProverModal, setShowProverModal] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [reasonAction, setReasonAction] = useState<"stop" | "pause">("stop")
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteModalPosition, setDeleteModalPosition] = useState({ x: 0, y: 0 })

  // Keep description in sync with selected routine; call hook unconditionally
  useEffect(() => {
    setDescription(routine?.description || "")
  }, [routine?.id, routine?.description])

  if (!routine) {
    return (
      <DetailPanelLayout onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No routine selected</p>
        </div>
      </DetailPanelLayout>
    )
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(routine.id, { name: editText.trim() })
      setIsEditing(false)
    }
  }

  const handleSaveDescription = () => {
    onUpdate(routine.id, { description })
  }

  const handleStakeSubmit = (amount: number, currency: string) => {
    onUpdate(routine.id, { stakeAmount: amount, stakeCurrency: currency })
  }

  const handleSaveMaxAbsence = () => {
    const days = Number.parseInt(maxAbsence)
    if (days > 0) {
      onUpdate(routine.id, { maxAbsence: days })
    }
    setMaxAbsence("")
  }

  const handleAddProverInstructions = () => {
    setModalPosition({ x: 0, y: 0 })
    setShowProverModal(true)
  }

  const handleProverSubmit = (message: string) => {
    onUpdate(routine.id, { proverInstructions: message })
    setShowProverModal(false)
  }

  const handleStopRoutine = () => {
    setModalPosition({ x: 0, y: 0 })
    setReasonAction("stop")
    setShowReasonModal(true)
  }

  const handlePauseRoutine = () => {
    setModalPosition({ x: 0, y: 0 })
    setReasonAction("pause")
    setShowReasonModal(true)
  }

  const handleReasonSubmit = (reason: string) => {
    if (reasonAction === "stop") {
      onStop(routine.id)
    } else {
      onPause(routine.id)
    }
    setShowReasonModal(false)
    onClose()
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    onDelete(routine.id)
    onClose()
  }

  const calculateAbsenceStreak = () => {
    const today = new Date()
    // Normalize dates to 00:00 for robust comparisons
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const created = routine.createdAt ? new Date(routine.createdAt) : null
    const earliestCompleted = routine.completedDates.length
      ? new Date(routine.completedDates[0] + "T00:00:00")
      : null
    const startBase = created ?? earliestCompleted ?? todayOnly
    const startOnly = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate())

    let absenceCount = 0
    // Count from yesterday backwards until a completion or creation date
    for (let i = 1; ; i++) {
      const d = new Date(todayOnly)
      d.setDate(d.getDate() - i)
      if (d < startOnly) break // do not count before creation/start date
      const dateString = d.toISOString().split("T")[0]
      if (routine.completedDates.includes(dateString)) break
      absenceCount++
    }
    return absenceCount
  }

  const currentAbsence = calculateAbsenceStreak()
  const daysSinceStart = (() => {
    const today = new Date()
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const created = routine.createdAt ? new Date(routine.createdAt) : null
    const earliestCompleted = routine.completedDates.length
      ? new Date(routine.completedDates[0] + "T00:00:00")
      : null
    const startBase = created ?? earliestCompleted ?? todayOnly
    const startOnly = new Date(startBase.getFullYear(), startBase.getMonth(), startBase.getDate())
    return Math.max(0, Math.floor((todayOnly.getTime() - startOnly.getTime()) / (1000 * 60 * 60 * 24)))
  })()
  const canExceed = typeof routine.maxAbsence === "number" ? daysSinceStart > routine.maxAbsence : false
  const isMaxAbsenceExceeded = !!routine.maxAbsence && canExceed && currentAbsence >= routine.maxAbsence

  const getTypeIcon = () => {
    switch (type) {
      case "daily":
        return <Calendar className="h-4 w-4" />
      case "weekly":
        return <Target className="h-4 w-4" />
      case "monthly":
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const generateStreakData = (): StreakData[] => {
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
      // Do not include dates prior to routine creation
      if (date < start) continue
      const dateString = date.toISOString().split("T")[0]
      const isCompleted = routine.completedDates.includes(dateString)

      data.push({ date: dateString, completed: isCompleted })
    }
    return data
  }

  const today = new Date().toISOString().split("T")[0]
  const isCompletedToday = routine.completedDates.includes(today)
  const streakData = generateStreakData()

  const getSuccessRate = () => {
    const start = routine.createdAt ? new Date(routine.createdAt) : new Date()
    const todayDate = new Date()
    if (type === "daily") {
      const daysSince = Math.max(1, Math.ceil((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
      return Math.round((routine.completedDates.length / daysSince) * 100)
    } else if (type === "weekly") {
      const weeksSince = Math.max(1, Math.ceil((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)))
      // Approximate: count unique ISO week numbers
      const uniqueWeeks = new Set(routine.completedDates.map((d) => d.slice(0, 7)))
      return Math.round((uniqueWeeks.size / weeksSince) * 100)
    } else {
      const monthsSince = Math.max(1, (todayDate.getFullYear() - start.getFullYear()) * 12 + (todayDate.getMonth() - start.getMonth()) + 1)
      const uniqueMonths = new Set(routine.completedDates.map((d) => d.slice(0, 7)))
      return Math.round((uniqueMonths.size / monthsSince) * 100)
    }
  }

  const statsData = [
    { label: "Total Completed", value: routine.completedDates.length },
    { label: "Success Rate", value: getSuccessRate(), suffix: "%" },
  ]

  return (
    <DetailPanelLayout
      onClose={onClose}
      onDelete={() => handleDeleteClick()}
      footerContent={`${routine.completedDates.length} completions`}
    >
      <div className="flex items-center gap-3">
        <CircularCheckbox
          checked={isCompletedToday}
          onClick={() => onToggle(routine.id)}
          variant={isMaxAbsenceExceeded ? "danger" : "default"}
        />

        <button
          className={`transition-colors ${routine.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
          onClick={() => onUpdate(routine.id, { starred: !routine.starred })}
          title={routine.starred ? "Unstar" : "Star"}
        >
          <Star className={`h-4 w-4 ${routine.starred ? "fill-current" : ""}`} />
        </button>

        <div className="flex items-center gap-1 text-muted-foreground">
          {getTypeIcon()}
          <span className="text-xs capitalize">{type}</span>
        </div>

        {isMaxAbsenceExceeded && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </div>

      {/* Title Edit */}
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit()
                if (e.key === "Escape") {
                  setIsEditing(false)
                  setEditText(routine.name)
                }
              }}
              className="text-lg font-medium"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditText(routine.name)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <h3
            className="text-lg font-medium text-foreground cursor-pointer hover:text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            {routine.name}
          </h3>
        )}
      </div>

      {/* Streak Visualization */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Streak Progress</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Streak</span>
            <span className="font-medium text-green-600 dark:text-green-400">{routine.streak} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Best Streak</span>
            <span className="font-medium">{routine.maxStreak} days</span>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <StreakVisualization streakData={streakData} maxAbsence={routine.maxAbsence} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Actions</label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggle(routine.id)}
            className="p-2 h-8 w-8"
            title={isCompletedToday ? "Mark as Incomplete" : "Mark as Complete"}
          >
            <Check className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePauseRoutine}
            className="p-2 h-8 w-8 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-transparent"
            title="Pause Routine"
          >
            <Pause className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleStopRoutine}
            className="p-2 h-8 w-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-transparent"
            title="Stop Routine"
          >
            <Square className="h-3 w-3 rounded-sm" />
          </Button>
        </div>
      </div>

      {/* Stake section */}
      <StakeSection
        currentStakeAmount={routine.stakeAmount}
        currentCurrency={routine.stakeCurrency}
        onStakeSubmit={handleStakeSubmit}
        onAddInstructions={handleAddProverInstructions}
        proverInstructions={routine.proverInstructions}
        description="Put money on the line to stay committed to your routine"
      />

      {/* Maximum Absence section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Maximum Absence</label>
        <div className="space-y-3">
          <InputWithButton
            value={maxAbsence}
            onChange={setMaxAbsence}
            onSubmit={handleSaveMaxAbsence}
            placeholder="Days"
            buttonText="Set"
            type="number"
          />
          {routine.maxAbsence && (
            <div
              className={`text-sm ${isMaxAbsenceExceeded ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
            >
              Max absence: {routine.maxAbsence} days {isMaxAbsenceExceeded && "(EXCEEDED)"}
            </div>
          )}
          {currentAbsence > 0 && (
            <div
              className={`text-sm ${isMaxAbsenceExceeded ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
            >
              Current absence: {currentAbsence} days
            </div>
          )}
          <p className="text-xs text-muted-foreground">Set maximum days you can miss before streak turns red</p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          placeholder="Add routine description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSaveDescription}
          className="min-h-[100px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Statistics</label>
        <StatsGrid stats={statsData} />
        {routine.completedDates.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Last completed: {new Date(routine.completedDates[routine.completedDates.length - 1]).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Prover Instructions Modal */}
      {showProverModal && (
        <SpeechBubbleModal
          isOpen={showProverModal}
          onClose={() => setShowProverModal(false)}
          position={modalPosition}
          title="Prover Instructions"
          arrowPosition="right-bottom"
          onSubmit={handleProverSubmit}
          initialMessage="Define specific conditions to prove you completed this routine. What evidence should you provide?"
        />
      )}

      {/* Reason Modal for stop/pause */}
      {showReasonModal && (
        <SpeechBubbleModal
          isOpen={showReasonModal}
          onClose={() => setShowReasonModal(false)}
          position={modalPosition}
          title="Provide a reason"
          arrowPosition="right-top"
          onSubmit={handleReasonSubmit}
          initialMessage={`Why are you ${reasonAction === "stop" ? "stopping" : "pausing"} this routine? This will help you understand your patterns.`}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Routine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this routine? All progress and streak data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DetailPanelLayout>
  )
}
