"use client"

import { useState } from "react"
import type { Todo } from "@/types"

export function useAppState() {
  const [activeList, setActiveList] = useState("today")
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  return {
    activeList,
    selectedTodo,
    selectedRoutineId,
    setActiveList,
    setSelectedTodo,
    setSelectedRoutineId,
  }
}
