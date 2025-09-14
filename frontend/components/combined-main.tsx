"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar1Icon, CalendarIcon, Plus, Star } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { EmptyState } from "@/components/ui/empty-state"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeBadge } from "@/components/ui/stake-badge"
import { StreakVisualization } from "@/components/ui/streak-visualization"
import { MobileHeader } from "@/components/ui/mobile-header"
import type { Routine, Todo, StreakData } from "@/types"
import { useProfile } from "@/hooks/use-profile"
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
  toggleRoutineStar: (id: string) => void
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
  toggleRoutineStar,
  selectedRoutineId,
  onSelectRoutine,
}: CombinedMainProps) {
  const [newItemText, setNewItemText] = useState("")
  const [newType, setNewType] = useState<"task" | "daily" | "weekly" | "monthly">("task")
  const [newStakeAmount, setNewStakeAmount] = useState("")
  const [newStakeCurrency, setNewStakeCurrency] = useState("SOL")
  const [newProverInstructions, setNewProverInstructions] = useState("")
  const [listMinHeight, setListMinHeight] = useState(0)
  const elHeaderRef = useRef<HTMLDivElement>(null)
  const elFooterRef = useRef<HTMLDivElement>(null)
  const elContentRef = useRef<HTMLDivElement>(null)
  const [triggerResize, setTriggerResize] = useState(false)

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
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])
  const isPastEnd = (r: Routine) => {
    if (!r.endDate) return false
    const end = new Date(r.endDate)
    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    const now = new Date()
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return todayOnly > endOnly
  }
  const endedRoutines = useMemo(() => routines.filter(isPastEnd), [routines])
  const activeRoutines = useMemo(
    () => routines.filter((r) => !r.stopped && !r.paused && !isPastEnd(r)),
    [routines],
  )
  const inactiveRoutines = useMemo(() => routines.filter((r) => r.stopped || r.paused), [routines])
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
    const ended = (() => {
      if (!routine.endDate) return false
      const end = new Date(routine.endDate)
      const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
      const now = new Date()
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      return todayOnly > endOnly
    })()
    const isCompletedToday = ended || routine.completedDates.includes(todayStr)
    const isSelected = selectedRoutineId === routine.id
    const isInactive = !!routine.stopped || !!routine.paused
    const streakData = generateStreakData(routine)
    return (
      <div data-role="routine-item"
        className={`rounded-lg px-3 transition-colors cursor-pointer ${
          isInactive ? "opacity-70" : ""
        } ${isSelected ? "bg-accent/50 hover:bg-card-foreground/8" : "hover:bg-card-foreground/8"}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelectRoutine(routine.id)
        }}
      >
        <div className="flex items-center justify-between relative py-2">
          <div className="flex items-center gap-2">
            <div className="mt-[1px] h-10">
              <CircularCheckbox
                checked={isCompletedToday}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isInactive && !ended) toggleRoutine(routine.id)
                }}
                className={isInactive ? "opacity-40" : ""}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isInactive ? "line-through" : ""}`}>{routine.name}</span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  {routine.type.charAt(0).toUpperCase() + routine.type.slice(1)}
                </span>
                {routine.endDate && (
                  <span className="text-[11px] text-muted-foreground">· until {new Date(routine.endDate).toLocaleDateString()}</span>
                )}
                {routine.stakeAmount && (
                  <StakeBadge amount={routine.stakeAmount} variant={isInactive ? "danger" : "success"} />
                )}
              </div>
              <StreakVisualization streakData={streakData} maxAbsence={ended ? undefined : routine.maxAbsence} className="mt-2 mb-1" />
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleRoutineStar(routine.id)
              }}
              className={`h-7 px-2 transition-colors ${routine.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
              title={routine.starred ? "Unstar" : "Star"}
            >
              <Star className={`h-4 w-4 ${routine.starred ? "fill-current" : ""}`} />
            </Button>
          </div>
          {/*<span className="text-xs text-muted-foreground">{routine.streak} day streak</span>*/}
          {/*<div className="absolute bottom-0 left-6 right-0 h-[1px] bg-card-foreground/10"></div>*/}
        </div>
      </div>
    )
  }

  const TodoItem = ({ todo, isCompleted = false }: { todo: Todo; isCompleted?: boolean }) => {
    return (
      <div data-role="todo-item"
        className={`px-3 ${isCompleted ? "opacity-70" : ""} rounded-lg w-full cursor-pointer transition-colors ${
          selectedTodoId === todo.id ? "bg-accent/50 hover:bg-card-foreground/8" : "hover:bg-card-foreground/8"
        }`}
        onClick={() => onSelectTodo(todo)}
      >
        <div className="flex items-center gap-2 py-2 relative">
          <div className="mt-[1px] h-9.5">
            <CircularCheckbox
              checked={todo.completed}
              onClick={(e) => {
                e.stopPropagation()
                toggleTodo(todo.id)
              }}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <span className={`text-foreground text-sm font-medium ${isCompleted ? "line-through" : ""}`}>
              {todo.text}
              {todo.stakeAmount && todo.stakeAmount > 0 && (
                <StakeBadge amount={todo.stakeAmount} className={isCompleted ? "opacity-60" : ""} variant={"success"} />
              )}
            </span>
            {/*"calendar icon"*/}
            <div className="flex items-center mt-1">
              <div className="text-xs text-muted-foreground mr-1">
                <CalendarIcon strokeWidth={1.5} className="h-3.5 w-3.5" />
              </div>
              <div className="text-xs text-muted-foreground">
                {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : activeList === "today" ? "Today" : activeList === "planned" ? "Planned" : "Task"}
              </div>
            </div>
          </div>
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
          {/*<div className="absolute bottom-0 left-6 right-0 h-[1px] bg-card-foreground/10"></div>*/}
        </div>
      </div>
    )
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('[data-role="todo-item"], [data-role="routine-item"]')) {
      onDeselectTodo()
    }
  }

  useEffect(() => {
    if (!elHeaderRef.current) return;
    if (!elFooterRef.current) return;
    if (!elContentRef.current) return;

    // calc(100% - var(--safe-area-inset-bottom) - var(--safe-area-inset-top) - 10em)
    const resize = () => {
      const headerHeight = elHeaderRef.current?.clientHeight ?? 0
      const footerHeight = elFooterRef.current?.clientHeight ?? 0
      const contentHeight = elContentRef.current?.clientHeight ?? 0

      let listMinHeight = document.body.clientHeight - headerHeight - footerHeight - contentHeight - 16;
      if (listMinHeight < 0) listMinHeight = 0;

      return setListMinHeight(listMinHeight)
    }

    window.addEventListener("resize", resize)

    resize();

    return () => {
      window.removeEventListener("resize", resize)
    };
  }, [elHeaderRef, elFooterRef, elContentRef, todos, routines, triggerResize]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative h-full" onClick={handleBackgroundClick}>
      <div
        className="flex-1 overflow-y-auto space-y-6 flex justify-center isolate"
        onClick={handleBackgroundClick}
      >
        <div className="w-full space-y-2 flex flex-col">
          <div className="sticky top-0 z-1 mt-6 supports-[backdrop-filter]:backdrop-blur p-3 md:p-4 pt-safe" ref={elHeaderRef}>
            {(() => {
              const openCount = incompleteTodos.length + openRoutines.length
              const completedCount = completedTodos.length + completedRoutinesToday.length + endedRoutines.length
              return (
                <PageHeader title={getListTitle()} subtitle={`${openCount} remaining, ${completedCount} completed`} onMenuClick={onMenuClick} />
              )
            })()}
          </div>
          <div className="p-3 md:p-4" ref={elContentRef}>
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

            {(() => {
              const endedForView = activeList === "today" || activeList === "planned" ? [] : endedRoutines
              const completedTotal = completedTodos.length + completedRoutinesToday.length + endedForView.length
              if (completedTotal <= 0) return null
              return (
              <CollapsibleSection
                title="Completed"
                count={completedTotal}
                defaultOpen={activeList === "today"}
                onOpenChange={() => setTriggerResize((prev) => !prev)}
              >
                {completedTodos.map((todo) => (
                  <TodoItem key={`ctodo-${todo.id}`} todo={todo} isCompleted />
                ))}
                {completedRoutinesToday.map((r) => (
                  <RoutineItem key={`croutine-${r.id}`} routine={r} />
                ))}
                {endedForView.map((r) => (
                  <RoutineItem key={`eroutine-${r.id}`} routine={r} />
                ))}
              </CollapsibleSection>
              )
            })()}

            {incompleteTodos.length === 0 && openRoutines.length === 0 && false && (
              <EmptyState title="All clear!" description="Add a new item to get started." />
            )}
          </div>

          <div className="flex-1"></div>

          <div style={{minHeight: listMinHeight + "px"}}></div>

          {/* Bottom-fixed input area within layout (non-scrolling) */}
          <div className="p-3 pt-2 supports-[backdrop-filter]:backdrop-blur sticky bottom-0 pb-safe" onClick={(e) => e.stopPropagation()} ref={elFooterRef}>
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
                    className="pl-11 h-12 text-base"
                  />
                </div>
              </div>
              {newType === "task" && false && (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Stake</span>
                  <Input
                    placeholder="0.00"
                    type="number"
                    value={newStakeAmount}
                    onChange={(e) => setNewStakeAmount(e.target.value)}
                    className="w-28 h-10 text-sm"
                  />
                  <Select value={newStakeCurrency} onValueChange={setNewStakeCurrency}>
                    <SelectTrigger className="w-24 h-10">
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
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
