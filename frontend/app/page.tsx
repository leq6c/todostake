"use client"

import type React from "react"
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

export default function TodoApp() {
  const appState = useAppState()
  const uiState = useUIState(appState.activeList)
  const todoOps = useTodoOperations()
  const routineOps = useRoutineOperations()

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

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
                selectedRoutineId={appState.selectedRoutineId}
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
                    ? {
                        id: appState.selectedRoutineId,
                        name: "Selected Routine",
                        type: currentView.routineType,
                        streak: 0,
                        maxStreak: 0,
                        completedDates: [],
                      }
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
