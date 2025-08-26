"use client"

import { useState } from "react"
import type { Todo, TodoList, Routine } from "@/types"

export function useAppState() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      text: "Review quarterly reports",
      completed: false,
      createdAt: new Date(),
      list: "today",
    },
    {
      id: "2",
      text: "Call client about project updates",
      completed: true,
      createdAt: new Date(),
      list: "today",
    },
    {
      id: "3",
      text: "Prepare presentation slides",
      completed: false,
      createdAt: new Date(),
      list: "planned",
    },
    {
      id: "4",
      text: "Check emails",
      completed: false,
      createdAt: new Date(),
      list: "today",
    },
    {
      id: "5",
      text: "Water plants",
      completed: false,
      createdAt: new Date(),
      list: "today",
    },
    {
      id: "6",
      text: "Take vitamins",
      completed: false,
      createdAt: new Date(),
      list: "planned",
    },
  ])

  const [customLists, setCustomLists] = useState<TodoList[]>([
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-green-500" },
    { id: "shopping", name: "Shopping", color: "bg-purple-500" },
  ])

  const [routines, setRoutines] = useState<Routine[]>([])
  const [activeList, setActiveList] = useState("today")
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)

  return {
    // State
    todos,
    customLists,
    routines,
    activeList,
    selectedTodo,
    selectedRoutineId,
    // Setters
    setTodos,
    setCustomLists,
    setRoutines,
    setActiveList,
    setSelectedTodo,
    setSelectedRoutineId,
  }
}
