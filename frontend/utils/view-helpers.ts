import type { Todo, Routine } from "@/types"

export function getCurrentView(activeList: string) {
  if (activeList.startsWith("routine-")) {
    const routineType = activeList.replace("routine-", "") as "daily" | "weekly" | "monthly"
    return { type: "routine" as const, routineType }
  }
  return { type: "todo" as const }
}

export function getFilteredTodos(todos: Todo[], activeList: string): Todo[] {
  return todos.filter((todo) => {
    if (activeList === "today") {
      const now = new Date()
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const isDueToday = (() => {
        if (!todo.dueDate) return false
        const due = new Date(todo.dueDate)
        const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate())
        return dueOnly.getTime() === todayOnly.getTime()
      })()
      const isAddedToday = (() => {
        if (!todo.todayAddedOn) return false
        const todayStr = todayOnly.toISOString().split("T")[0]
        return todo.todayAddedOn === todayStr
      })()
      return isDueToday || isAddedToday
    }
    if (activeList === "planned") {
      // Only tasks with an explicit due date and not completed
      return !!todo.dueDate && !todo.completed
    }
    if (activeList === "tasks") {
      return true
    }
    return todo.list === activeList
  })
}

export function getTodoCounts(todos: Todo[], routines: Routine[]) {
  const now = new Date()
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayStr = todayOnly.toISOString().split("T")[0]

  const isDueToday = (d?: number | null) => {
    if (!d) return false
    const due = new Date(d)
    const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    return dueOnly.getTime() === todayOnly.getTime()
  }

  const todayTodosOpen = todos.filter((t) => !t.completed && (isDueToday(t.dueDate) || t.todayAddedOn === todayStr)).length
  const isPastEnd = (r: Routine) => {
    if (!r.endDate) return false
    const end = new Date(r.endDate)
    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    return todayOnly.getTime() > endOnly
  }
  const openRoutinesCount = routines.filter((r) => !r.stopped && !r.paused && !isPastEnd(r) && !r.completedDates.includes(todayStr)).length

  const plannedTodosOpen = todos.filter((t) => !t.completed && !!t.dueDate).length
  const allOpenTodos = todos.filter((t) => !t.completed).length

  return {
    today: todayTodosOpen + openRoutinesCount,
    planned: plannedTodosOpen + openRoutinesCount,
    tasks: allOpenTodos + openRoutinesCount,
  }
}
