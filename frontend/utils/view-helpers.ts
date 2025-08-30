import type { Todo } from "@/types"

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
      // Show upcoming or unscheduled and not completed
      return !todo.completed
    }
    if (activeList === "tasks") {
      return true
    }
    return todo.list === activeList
  })
}

export function getTodoCounts(todos: Todo[]) {
  return {
    today: todos.filter((t) => {
      const now = new Date()
      const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const isDueToday = (() => {
        if (!t.dueDate) return false
        const due = new Date(t.dueDate)
        const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate())
        return dueOnly.getTime() === todayOnly.getTime()
      })()
      const isAddedToday = (() => {
        if (!t.todayAddedOn) return false
        const todayStr = todayOnly.toISOString().split("T")[0]
        return t.todayAddedOn === todayStr
      })()
      return isDueToday || isAddedToday
    }).length,
    planned: todos.filter((t) => !t.completed).length,
    tasks: todos.length,
  }
}
