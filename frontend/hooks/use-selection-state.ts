"use client"

import type { Todo } from "@/types"

interface UseSelectionStateProps {
  selectedTodo: Todo | null
  selectedRoutineId: string | null
  setSelectedTodo: (todo: Todo | null) => void
  setSelectedRoutineId: (id: string | null) => void
  setRightPanelOpen: (open: boolean) => void
}

export function useSelectionState({
  selectedTodo,
  selectedRoutineId,
  setSelectedTodo,
  setSelectedRoutineId,
  setRightPanelOpen,
}: UseSelectionStateProps) {
  const selectTodo = (todo: Todo) => {
    setSelectedTodo(todo)
    setSelectedRoutineId(null)
    setRightPanelOpen(true)
  }

  const deselectTodo = () => {
    if (window.innerWidth < 1200) {
      setRightPanelOpen(false)
      setSelectedTodo(null)
    } else {
      setSelectedTodo(null)
    }
  }

  const selectRoutine = (routineId: string | null) => {
    setSelectedRoutineId(routineId)
    setSelectedTodo(null)
    if (routineId) {
      setRightPanelOpen(true)
    }
  }

  const closeRightPanel = () => {
    if (window.innerWidth < 1200) {
      setRightPanelOpen(false)
      setSelectedTodo(null)
      setSelectedRoutineId(null)
    } else {
      setSelectedTodo(null)
      setSelectedRoutineId(null)
    }
  }

  return {
    selectTodo,
    deselectTodo,
    selectRoutine,
    closeRightPanel,
  }
}
