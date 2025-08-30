"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckSquare, List, Plus, Sun, Moon, Repeat, TrendingUp, MoreHorizontal, Trash2 } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useModal } from "@/components/providers/modal-provider"
import type { TodoList, TodoCounts } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

interface TodoSidebarProps {
  activeList: string
  setActiveList: (list: string) => void
  customLists: TodoList[]
  addCustomList: (name: string, color: string) => void
  deleteCustomList: (id: string) => void // Added delete function prop
  todoCounts: TodoCounts
}

export function TodoSidebar({
  activeList,
  setActiveList,
  customLists,
  addCustomList,
  deleteCustomList, // Added delete function prop
  todoCounts,
}: TodoSidebarProps) {
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState("")
  const { showModal } = useModal()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddList = () => {
    if (newListName.trim()) {
      const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      addCustomList(newListName.trim(), randomColor)
      setNewListName("")
      setShowAddList(false)
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
  }

  const handleAccountClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    showModal({
      type: "account",
      position: { x: rect.right + 8, y: rect.top },
      arrowPosition: "left-top",
    })
  }

  const handleDeleteList = (listId: string, listName: string, event: React.MouseEvent) => {
    event.stopPropagation()

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    showModal({
      type: "confirmation",
      position: { x: rect.right + 8, y: rect.top },
      arrowPosition: "left-center",
      data: {
        title: "Delete List",
        description: `Are you sure you want to delete "${listName}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: () => {
          deleteCustomList(listId)
          if (activeList === listId) {
            setActiveList("today")
          }
        },
      },
    })
  }

  const defaultLists = [
    { id: "today", name: "Today", icon: Calendar, count: todoCounts.today },
    { id: "planned", name: "Planned", icon: CheckSquare, count: todoCounts.planned },
    { id: "tasks", name: "All Tasks", icon: List, count: todoCounts.tasks },
  ]

  const routineTypes = [
    { id: "routine-daily", name: "Daily", type: "daily" as const },
    { id: "routine-weekly", name: "Weekly", type: "weekly" as const },
    { id: "routine-monthly", name: "Monthly", type: "monthly" as const },
  ]

  return (
    <div className="w-full bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
          onClick={handleAccountClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-foreground text-background font-medium text-sm">
              {(user?.displayName || user?.email || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate text-sm">{user?.displayName || (user?.isAnonymous ? "Guest" : "User")}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.isAnonymous ? "Guest" : user?.email || "Signed in"}</p>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-1">
          {mounted && (
            <>
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="flex-1 h-8"
              >
                <Sun className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="flex-1 h-8"
              >
                <Moon className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Default Lists */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {defaultLists.map((list) => {
            const Icon = list.icon
            return (
              <Button
                key={list.id}
                variant={activeList === list.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => setActiveList(list.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{list.name}</span>
                {list.count > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {list.count}
                  </Badge>
                )}
              </Button>
            )
          })}

          <Button
            variant={activeList === "reliability" ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 h-8 text-sm"
            onClick={() => setActiveList("reliability")}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="flex-1 text-left">Score</span>
          </Button>
        </div>

        {/* Routine */}
        <div className="px-4 pb-4">
          <div className="border-t border-sidebar-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Routine</h3>
            </div>

            <div className="space-y-1">
              {routineTypes.map((routine) => (
                <Button
                  key={routine.id}
                  variant={activeList === routine.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 h-8 text-sm"
                  onClick={() => setActiveList(routine.id)}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="flex-1 text-left">{routine.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Lists */}
        {customLists.length > 0 && (
          <div className="px-4 pb-4">
            <div className="border-t border-sidebar-border pt-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">My Lists</h3>
              <div className="space-y-1">
                {customLists.map((list) => (
                  <div
                    key={list.id}
                    className={`flex items-center group rounded-md transition-colors ${
                      activeList === list.id ? "bg-secondary" : "hover:bg-muted/50"
                    }`}
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start gap-2 h-8 text-sm hover:bg-transparent"
                      onClick={() => setActiveList(list.id)}
                    >
                      <div className={`w-2 h-2 rounded-full ${list.color}`} />
                      <span className="flex-1 text-left">{list.name}</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent mr-1"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteList(list.id, list.name, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add List */}
        <div className="px-4 pb-4">
          {showAddList ? (
            <div className="space-y-2">
              <Input
                placeholder="List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddList} className="flex-1 h-7 text-xs">
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddList(false)
                    setNewListName("")
                  }}
                  className="flex-1 h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-8 text-muted-foreground text-sm"
              onClick={() => setShowAddList(true)}
            >
              <Plus className="h-4 w-4" />
              Add List
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
