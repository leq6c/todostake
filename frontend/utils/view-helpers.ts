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
      const today = new Date()
      return todo.createdAt.toDateString() === today.toDateString()
    }
    if (activeList === "planned") {
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
    today: todos.filter((t) => t.createdAt.toDateString() === new Date().toDateString()).length,
    planned: todos.filter((t) => !t.completed).length,
    tasks: todos.length,
  }
}
