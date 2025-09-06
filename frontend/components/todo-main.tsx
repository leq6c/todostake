"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { Star } from "lucide-react" // Added import for Star
import { useModal } from "@/components/providers/modal-provider"
import { PageHeader } from "@/components/ui/page-header"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { EmptyState } from "@/components/ui/empty-state"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeBadge } from "@/components/ui/stake-badge"
import { MobileHeader } from "@/components/ui/mobile-header" // Added import for MobileHeader
import type { Todo } from "@/types"

interface TodoMainProps {
  todos: Todo[]
  activeList: string
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  toggleStar: (id: string) => void // Added toggleStar prop
  onSelectTodo: (todo: Todo) => void
  selectedTodoId?: string
  onDeselectTodo: () => void
  onMenuClick?: () => void
}

export function TodoMain({
  todos,
  activeList,
  addTodo,
  toggleTodo,
  deleteTodo,
  toggleStar, // Added toggleStar to destructured props
  onSelectTodo,
  selectedTodoId,
  onDeselectTodo,
  onMenuClick,
}: TodoMainProps) {
  const [newTodoText, setNewTodoText] = useState("")
  const { showModal } = useModal()

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      addTodo(newTodoText.trim())
      setNewTodoText("")
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent, todoId: string, isCompleted: boolean) => {
    e.stopPropagation()

    if (!isCompleted) {
      const todo = todos.find((t) => t.id === todoId)
      const hasStake = todo?.stakeAmount && todo.stakeAmount > 0

      if (hasStake) {
        const rect = e.currentTarget.getBoundingClientRect()
        showModal({
          type: "proof",
          position: { x: rect.right + 8, y: rect.top + rect.height / 2 },
          arrowPosition: "left-center",
          data: { todoId },
          onSubmit: (data) => {
            toggleTodo(data.todoId)
          },
        })
      } else {
        toggleTodo(todoId)
      }
    } else {
      toggleTodo(todoId)
    }
  }

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

  const completedTodos = todos.filter((todo) => todo.completed)
  const incompleteTodos = todos.filter((todo) => !todo.completed)

  const getTodoDescription = (todo: Todo) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate)
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

      if (dueDateOnly.getTime() === today.getTime()) {
        return "Today"
      } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
        return "Tomorrow"
      } else if (dueDateOnly < today) {
        return "Overdue"
      } else {
        return "Planned"
      }
    }

    // Default descriptions based on current list
    switch (activeList) {
      case "today":
        return "Today"
      case "planned":
        return "Planned"
      default:
        return "Task"
    }
  }

  const TodoItem = ({ todo, isCompleted = false }: { todo: Todo; isCompleted?: boolean }) => (
    <div
      className={`py-1.5 px-2 ${isCompleted ? "opacity-60" : ""} bg-card rounded-lg border w-full cursor-pointer transition-colors ${
        selectedTodoId === todo.id ? "border-foreground/30 bg-accent/50" : "border-1 border-border hover:bg-card/60"
      }`}
      onClick={() => onSelectTodo(todo)}
    >
      <div className="flex items-center gap-2">
        <CircularCheckbox checked={todo.completed} onClick={(e) => handleCheckboxClick(e, todo.id, todo.completed)} />
        <div className="flex-1 flex flex-col">
          <span className={`text-card-foreground text-sm font-medium ${isCompleted ? "line-through" : ""}`}>{todo.text}</span>
          <div className="text-xs text-muted-foreground">{getTodoDescription(todo)}</div>
        </div>
        {todo.stakeAmount && todo.stakeAmount > 0 && (
          <StakeBadge amount={todo.stakeAmount} className={isCompleted ? "opacity-60" : ""} />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            toggleStar(todo.id) // Connected star toggle to actual functionality
          }}
          className={`transition-colors ${todo.starred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
        >
          <Star className={`h-4 w-4 ${todo.starred ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 relative h-full">
      <MobileHeader title={getListTitle()} onMenuClick={onMenuClick} />

      <PageHeader
        title={getListTitle()}
        subtitle={`${incompleteTodos.length} remaining, ${completedTodos.length} completed`}
      />

      {/* Todo List */}
      <div
        className="flex-1 overflow-y-auto p-3 md:p-4 flex justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onDeselectTodo()
          }
        }}
      >
        <div className="w-full space-y-2">
          {/* Incomplete Todos */}
          {incompleteTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}

          {completedTodos.length > 0 && (
            <CollapsibleSection
              title="Completed"
              count={completedTodos.length}
              defaultOpen={activeList === "today"} // Added defaultOpen prop
            >
              {completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} isCompleted />
              ))}
            </CollapsibleSection>
          )}

          {todos.length === 0 && <EmptyState title="All clear!" description="Add a new task to get started." />}
        </div>
      </div>

      <div className="p-3 pt-0 backdrop-blur-sm">
        <div className="w-full">
          <div className="flex gap-3">
            <div className="flex-1 relative rounded border-1 dark:border-none">
              <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Add a new task..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                className="pl-11 h-12 text-base border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
