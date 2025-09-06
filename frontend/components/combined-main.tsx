"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Star } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { EmptyState } from "@/components/ui/empty-state"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeBadge } from "@/components/ui/stake-badge"
import { StreakVisualization } from "@/components/ui/streak-visualization"
import { MobileHeader } from "@/components/ui/mobile-header"
import type { Routine, Todo, StreakData } from "@/types"

interface CombinedMainProps {
  // Active context
  activeList: string
  onMenuClick?: () => void

  // Todos
  todos: Todo[]
  addTodoWithMeta: (text: string, stakeAmount?: number, stakeCurrency?: string, proverInstructions?: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  toggleStar: (id: string) => void
  onSelectTodo: (todo: Todo) => void
  selectedTodoId?: string
  onDeselectTodo: () => void

  // Routines
  routines: Routine[]
  addRoutine: (name: string, type: Routine["type"]) => void
  toggleRoutine: (id: string) => void
  selectedRoutineId?: string | null
  onSelectRoutine: (id: string | null) => void
}

export function CombinedMain({
  activeList,
  onMenuClick,
  // todos
  todos,
  addTodoWithMeta,
  toggleTodo,
  deleteTodo,
  toggleStar,
  onSelectTodo,
  selectedTodoId,
  onDeselectTodo,
  // routines
  routines,
  addRoutine,
  toggleRoutine,
  selectedRoutineId,
  onSelectRoutine,
}: CombinedMainProps) {
  const [newItemText, setNewItemText] = useState("")
  const [newType, setNewType] = useState<"task" | "daily" | "weekly" | "monthly">("task")
  const [newStakeAmount, setNewStakeAmount] = useState("")
  const [newStakeCurrency, setNewStakeCurrency] = useState("SOL")
  const [newProverInstructions, setNewProverInstructions] = useState("")

  const completedTodos = useMemo(() => todos.filter((t) => t.completed), [todos])
  const incompleteTodos = useMemo(() => todos.filter((t) => !t.completed), [todos])

  const getListTitle = () => {
    switch (activeList) {
      case "today":
        return "Today"
      case "planned":
        return "Planned"
      case "tasks":
        return "All Tasks"
      default:
        return activeList.charAt(0).toUpperCase() + activeList.slice(1)
    }
  }

  const handleSubmitNew = () => {
    if (!newItemText.trim()) return
    if (newType === "task") {
      const amount = Number.parseFloat(newStakeAmount)
      addTodoWithMeta(
        newItemText.trim(),
        isNaN(amount) || amount <= 0 ? undefined : amount,
        newStakeCurrency,
        newProverInstructions.trim() || undefined,
      )
    } else {
      addRoutine(newItemText.trim(), newType)
    }
    setNewItemText("")
    setNewStakeAmount("")
    setNewProverInstructions("")
  }

  // Routines grouping
  const activeRoutines = useMemo(() => routines.filter((r) => !r.stopped && !r.paused), [routines])
  const inactiveRoutines = useMemo(() => routines.filter((r) => r.stopped || r.paused), [routines])
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])
  const openRoutines = useMemo(
    () => activeRoutines.filter((r) => !r.completedDates.includes(todayStr)),
    [activeRoutines, todayStr],
  )
  const completedRoutinesToday = useMemo(
    () => activeRoutines.filter((r) => r.completedDates.includes(todayStr)),
    [activeRoutines, todayStr],
  )

  const generateStreakData = (routine: Routine): StreakData[] => {
    const data: StreakData[] = []
    const today = new Date()
    const daysToShow = routine.type === "daily" ? 30 : routine.type === "weekly" ? 12 : 6
    const start = routine.createdAt ? new Date(routine.createdAt) : new Date(today)

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today)
      if (routine.type === "daily") {
        date.setDate(date.getDate() - i)
      } else if (routine.type === "weekly") {
        date.setDate(date.getDate() - i * 7)
      } else {
        date.setMonth(date.getMonth() - i)
      }
      if (date < start) continue
      const dateString = date.toISOString().split("T")[0]
      const isCompleted = routine.completedDates.includes(dateString)
      data.push({ date: dateString, completed: isCompleted })
    }
    return data
  }

  const RoutineItem = ({ routine }: { routine: Routine }) => {
    const today = new Date().toISOString().split("T")[0]
    const isCompletedToday = routine.completedDates.includes(todayStr)
    const isSelected = selectedRoutineId === routine.id
    const isInactive = !!routine.stopped || !!routine.paused
    const streakData = generateStreakData(routine)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircularCheckbox
              checked={isCompletedToday}
              onClick={(e) => {
                e.stopPropagation()
                if (!isInactive) toggleRoutine(routine.id)
              }}
              className={isInactive ? "opacity-40" : ""}
            />
            <span className={`text-sm font-medium ${isInactive ? "line-through" : ""}`}>{routine.name}</span>
            {routine.stakeAmount && <StakeBadge amount={routine.stakeAmount} variant={isInactive ? "danger" : "success"} />}
          </div>
          <span className="text-xs text-muted-foreground">{routine.streak} day streak</span>
        </div>
        <StreakVisualization streakData={streakData} maxAbsence={routine.maxAbsence} className="mt-2 mb-1" />
      </div>
    )
  }

  const TodoItem = ({ todo, isCompleted = false }: { todo: Todo; isCompleted?: boolean }) => (
    <div
      className={`py-1.5 px-2 ${isCompleted ? "opacity-60" : ""} bg-card rounded-lg border w-full cursor-pointer transition-colors ${
        selectedTodoId === todo.id ? "border-foreground/30 bg-accent/50" : "border-border hover:bg-card/60"
      }`}
      onClick={() => onSelectTodo(todo)}
    >
      <div className="flex items-center gap-2">
        <CircularCheckbox
          checked={todo.completed}
          onClick={(e) => {
            e.stopPropagation()
            toggleTodo(todo.id)
          }}
        />
        <div className="flex-1 flex flex-col">
          <span className={`text-card-foreground text-sm ${isCompleted ? "line-through" : ""}`}>{todo.text}</span>
          <div className="text-xs text-muted-foreground">
            {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : activeList === "today" ? "Today" : activeList === "planned" ? "Planned" : "Task"}
          </div>
        </div>
        {todo.stakeAmount && todo.stakeAmount > 0 && (
          <StakeBadge amount={todo.stakeAmount} className={isCompleted ? "opacity-60" : ""} />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            toggleStar(todo.id)
          }}
          className={`transition-colors ${todo.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
        >
          <Star className={`h-4 w-4 ${todo.starred ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 relative h-full" onClick={(e) => e.currentTarget === e.target && onDeselectTodo()}>
      <MobileHeader title={getListTitle()} onMenuClick={onMenuClick} />

      {(() => {
        const openCount = incompleteTodos.length + openRoutines.length
        const completedCount = completedTodos.length + completedRoutinesToday.length
        return (
          <PageHeader title={getListTitle()} subtitle={`${openCount} remaining, ${completedCount} completed`} />
        )
      })()}

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-full space-y-2">
          {incompleteTodos.map((todo) => (
            <TodoItem key={`todo-${todo.id}`} todo={todo} />
          ))}
          {openRoutines.map((r) => (
            <RoutineItem key={`routine-${r.id}`} routine={r} />
          ))}

          {inactiveRoutines.length > 0 && (
            <CollapsibleSection title="Paused/Stopped" count={inactiveRoutines.length}>
              {inactiveRoutines.map((r) => (
                <RoutineItem key={`inactive-${r.id}`} routine={r} />
              ))}
            </CollapsibleSection>
          )}

          {(completedTodos.length + completedRoutinesToday.length) > 0 && (
            <CollapsibleSection
              title="Completed"
              count={completedTodos.length + completedRoutinesToday.length}
              defaultOpen={activeList === "today"}
            >
              {completedTodos.map((todo) => (
                <TodoItem key={`ctodo-${todo.id}`} todo={todo} isCompleted />
              ))}
              {completedRoutinesToday.map((r) => (
                <RoutineItem key={`croutine-${r.id}`} routine={r} />
              ))}
            </CollapsibleSection>
          )}

          {incompleteTodos.length === 0 && openRoutines.length === 0 && (
            <EmptyState title="All clear!" description="Add a new item to get started." />
          )}
        </div>
      </div>

      {/* Bottom-fixed input area within layout (non-scrolling) */}
      <div className="p-3 pt-0 bg-background/95 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {(["task", "daily", "weekly", "monthly"] as const).map((t) => (
              <Button
                key={t}
                variant={newType === t ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setNewType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative rounded">
              <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={`Add a new ${newType === "task" ? "task" : newType + " routine"}...`}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitNew()}
                className="pl-11 h-12 text-base border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none"
              />
            </div>
          </div>
          {newType === "task" && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Stake</span>
              <Input
                placeholder="0.00"
                type="number"
                value={newStakeAmount}
                onChange={(e) => setNewStakeAmount(e.target.value)}
                className="w-28 h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 outline-none"
              />
              <Select value={newStakeCurrency} onValueChange={setNewStakeCurrency}>
                <SelectTrigger className="w-24 h-10 border-0 focus:ring-0 focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Instructions (optional)"
                value={newProverInstructions}
                onChange={(e) => setNewProverInstructions(e.target.value)}
                className="flex-1 h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
