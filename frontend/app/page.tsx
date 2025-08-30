"use client"

import React, { useState } from "react"
import { TodoSidebar } from "@/components/todo-sidebar"
import { TodoMain } from "@/components/todo-main"
import { TodoDetailPanel } from "@/components/todo-detail-panel"
import { RoutinePage } from "@/components/routine-page"
import { RoutineDetailPanel } from "@/components/routine-detail-panel"
import { ReliabilityChartPage } from "@/components/reliability-chart-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

import { useAppState } from "@/hooks/use-app-state"
import { useUIState } from "@/hooks/use-ui-state"
import { useSelectionState } from "@/hooks/use-selection-state"
import { useTodoOperations } from "@/hooks/use-todo-operations"
import { useRoutineOperations } from "@/hooks/use-routine-operations"
import { getCurrentView, getFilteredTodos, getTodoCounts } from "@/utils/view-helpers"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function TodoApp() {
  const { user, loading, signInWithGoogle, signInGuest, signUpWithEmail, signInWithEmail, resetPassword } = useAuth()
  const appState = useAppState()
  const uiState = useUIState(appState.activeList)
  const todoOps = useTodoOperations()
  const routineOps = useRoutineOperations()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const selectionState = useSelectionState({
    selectedTodo: appState.selectedTodo,
    selectedRoutineId: appState.selectedRoutineId,
    setSelectedTodo: appState.setSelectedTodo,
    setSelectedRoutineId: appState.setSelectedRoutineId,
    setRightPanelOpen: uiState.setRightPanelOpen,
  })

  const currentView = getCurrentView(appState.activeList)
  const filteredTodos = getFilteredTodos(todoOps.todos, appState.activeList)
  const todoCounts = getTodoCounts(todoOps.todos)

  const handleMouseDown = (e: React.MouseEvent) => {
    uiState.setIsResizing(true)
    e.preventDefault()
  }

  const handleMenuClick = () => {
    uiState.setSidebarOpen(!uiState.sidebarOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Sign in to continue</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your todos are securely synced and available offline.
          </p>
          <div className="space-y-3">
            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  if (isSignUp) {
                    await signUpWithEmail(email, password, name || undefined)
                    toast({ title: "Welcome", description: "Account created" })
                  } else {
                    await signInWithEmail(email, password)
                    toast({ title: "Signed in" })
                  }
                } catch (e: any) {
                  toast({ title: "Auth error", description: e?.message || "Unable to authenticate" })
                }
              }}
            >
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
            {!isSignUp && (
              <button
                className="text-xs text-muted-foreground hover:underline text-left"
                onClick={async () => {
                  try {
                    if (email) {
                      await resetPassword(email)
                      toast({ title: "Password reset", description: "Check your email" })
                    }
                  } catch (e: any) {
                    toast({ title: "Reset failed", description: e?.message || "Unable to send reset email" })
                  }
                }}
              >
                Forgot password?
              </button>
            )}
            <Button className="w-full" onClick={async () => {
              try {
                await signInWithGoogle()
              } catch (e: any) {
                toast({ title: "Google sign-in failed", description: e?.message })
              }
            }}>
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={async () => {
              try {
                await signInGuest()
              } catch (e: any) {
                toast({ title: "Guest sign-in failed", description: e?.message })
              }
            }}>
              Continue as guest
            </Button>
            <button
              className="text-xs text-muted-foreground hover:underline w-full text-center"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => uiState.setSidebarOpen(!uiState.sidebarOpen)}
            className="bg-background/80 backdrop-blur-sm border"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {uiState.sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => uiState.setSidebarOpen(false)} />
        )}

        <div
          ref={uiState.sidebarRef}
          className={`
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          transform ${uiState.sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
        `}
          style={{ width: `${uiState.sidebarWidth}px` }}
        >
          <TodoSidebar
            activeList={appState.activeList}
            setActiveList={(list) => {
              appState.setActiveList(list)
              uiState.setSidebarOpen(false)
              if (list === "reliability") {
                uiState.setRightPanelOpen(false)
              }
            }}
            customLists={todoOps.customLists}
            addCustomList={todoOps.addCustomList}
            deleteCustomList={todoOps.deleteCustomList}
            todoCounts={todoCounts}
          />

          <div
            className="hidden md:block absolute right-0 top-0 bottom-0 w-1 bg-none hover:bg-foreground/20 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
          />
        </div>

        <div className={`flex-1 flex ${uiState.rightPanelOpen ? "md:mr-80" : ""}`}>
          {appState.activeList === "reliability" ? (
            <div className="flex-1 flex flex-col min-h-0 relative">
              <ReliabilityChartPage onMenuClick={handleMenuClick} />
            </div>
          ) : currentView.type === "routine" ? (
            <div className="flex-1 flex flex-col min-h-0 relative">
              <RoutinePage
                type={currentView.routineType}
                selectedRoutineId={appState.selectedRoutineId ?? undefined}
                onSelectRoutine={selectionState.selectRoutine}
                onMenuClick={handleMenuClick}
              />
            </div>
          ) : (
            <TodoMain
              todos={filteredTodos}
              activeList={appState.activeList}
              addTodo={(text) => todoOps.addTodo(text, appState.activeList)}
              toggleTodo={todoOps.toggleTodo}
              deleteTodo={todoOps.deleteTodo}
              toggleStar={todoOps.toggleStar}
              onSelectTodo={selectionState.selectTodo}
              selectedTodoId={appState.selectedTodo?.id}
              onDeselectTodo={selectionState.deselectTodo}
              onMenuClick={handleMenuClick}
            />
          )}
        </div>

        {uiState.rightPanelOpen && appState.activeList !== "reliability" && (
          <div className="fixed right-0 top-0 bottom-0 z-30">
            {currentView.type === "todo" ? (
              <TodoDetailPanel
                todo={appState.selectedTodo}
                onClose={selectionState.closeRightPanel}
                onUpdate={todoOps.updateTodo}
                onDelete={todoOps.deleteTodo}
                onToggle={todoOps.toggleTodo}
              />
            ) : (
              <RoutineDetailPanel
                routine={
                  appState.selectedRoutineId
                    ? routineOps.routines.find((r) => r.id === appState.selectedRoutineId) || null
                    : null
                }
                onClose={selectionState.closeRightPanel}
                onUpdate={routineOps.updateRoutine}
                onDelete={routineOps.deleteRoutine}
                onToggle={routineOps.toggleRoutine}
                onStop={routineOps.stopRoutine}
                onPause={routineOps.pauseRoutine}
                type={currentView.routineType}
              />
            )}
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
