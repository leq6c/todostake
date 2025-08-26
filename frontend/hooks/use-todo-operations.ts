"use client"

import { useState } from "react"
import type { Todo, TodoList } from "@/types"
import { useReliabilityScore } from "@/hooks/use-reliability-score"
import { getTaskCompletionContext, generateReliabilityReason } from "@/utils/reliability-helpers"

export function useTodoOperations() {
  const { updateReliabilityScore } = useReliabilityScore()

  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      text: "Review quarterly reports",
      completed: false,
      createdAt: new Date(),
      list: "today",
      starred: false, // Added starred property to mock data
    },
    {
      id: "2",
      text: "Call client about project updates",
      completed: true,
      createdAt: new Date(),
      list: "today",
      starred: true, // Added starred property to mock data
    },
    {
      id: "3",
      text: "Prepare presentation slides",
      completed: false,
      createdAt: new Date(),
      list: "planned",
      starred: false, // Added starred property to mock data
    },
  ])

  const [customLists, setCustomLists] = useState<TodoList[]>([
    { id: "work", name: "Work", color: "bg-blue-500" },
    { id: "personal", name: "Personal", color: "bg-green-500" },
    { id: "shopping", name: "Shopping", color: "bg-purple-500" },
  ])

  const addTodo = (text: string, activeList: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      list: activeList,
      starred: false, // Added default starred value for new todos
    }
    setTodos((prev) => [...prev, newTodo])
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, completed: !todo.completed }

          const context = getTaskCompletionContext(updatedTodo)
          const action = updatedTodo.completed ? "complete_task" : "miss_task"
          const reason = generateReliabilityReason(action, updatedTodo.text, context)

          updateReliabilityScore(action, reason, context)

          return updatedTodo
        }
        return todo
      }),
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)))
  }

  const toggleStar = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, starred: !todo.starred } : todo)))
  }

  const addCustomList = (name: string, color: string) => {
    const newList: TodoList = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      color,
    }
    setCustomLists((prev) => [...prev, newList])
  }

  const deleteCustomList = (id: string) => {
    setCustomLists((prev) => prev.filter((list) => list.id !== id))
    // Also remove todos that belong to this list
    setTodos((prev) => prev.filter((todo) => todo.list !== id))
  }

  const getFilteredTodos = (activeList: string) => {
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

  const getTodoCounts = () => ({
    today: todos.filter((t) => t.createdAt.toDateString() === new Date().toDateString()).length,
    planned: todos.filter((t) => !t.completed).length,
    tasks: todos.length,
  })

  return {
    todos,
    customLists,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    toggleStar,
    addCustomList,
    deleteCustomList,
    getFilteredTodos,
    getTodoCounts,
  }
}
