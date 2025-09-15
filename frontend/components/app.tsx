"use client"

import React, { useRef, useState } from "react"
import { TodoSidebar } from "@/components/todo-sidebar"
import { TodoDetailPanel } from "@/components/todo-detail-panel"
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
import { getFilteredTodos, getTodoCounts } from "@/utils/view-helpers"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { CombinedMain } from "@/components/combined-main"
import { HomeDex } from "@/components/home-dex"
import { useProfile } from "@/hooks/use-profile"
import AnimatedBackground from "@/components/ui/animated-background"

export interface TodoAppMainProps {
  floatingMode?: boolean
}

export default function TodoAppMain(props?: TodoAppMainProps) {
  const { user, loading, signInWithGoogle, signInGuest, signUpWithEmail, signInWithEmail, resetPassword } = useAuth()
  const appState = useAppState()
  const uiState = useUIState(appState.activeList)
  const todoOps = useTodoOperations()
  const routineOps = useRoutineOperations()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  // Mobile sidebar drag state
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState<number | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  // Sidebar close gesture refs
  const closeStartXRef = useRef<number | null>(null)
  const closeStartYRef = useRef<number | null>(null)
  // Right detail panel drag-to-close state
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false)
  const [rightDragX, setRightDragX] = useState(0)
  const [isClosingRightPanel, setIsClosingRightPanel] = useState(false)
  const panelStartXRef = useRef<number | null>(null)
  const panelStartYRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const RIGHT_PANEL_WIDTH = 320

  const selectionState = useSelectionState({
    selectedTodo: appState.selectedTodo,
    selectedRoutineId: appState.selectedRoutineId,
    setSelectedTodo: appState.setSelectedTodo,
    setSelectedRoutineId: appState.setSelectedRoutineId,
    setRightPanelOpen: uiState.setRightPanelOpen,
  })

  const filteredTodos = getFilteredTodos(todoOps.todos, appState.activeList)
  const todoCounts = getTodoCounts(todoOps.todos, routineOps.routines)
  const { profile } = useProfile()

  const floatingMode = props?.floatingMode ?? profile?.floatingWindowMode ?? true

  const handleMouseDown = (e: React.MouseEvent) => {
    uiState.setIsResizing(true)
    e.preventDefault()
  }

  const handleMenuClick = () => {
    uiState.setSidebarOpen(!uiState.sidebarOpen)
  }

  // Edge-swipe to open sidebar on mobile
  const onTouchStartEdge: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (uiState.sidebarOpen) return
    const touch = e.touches[0]
    // Only start if within 24px from left edge
    if (touch.clientX > 24) return
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    draggingRef.current = false
  }

  const onTouchMoveEdge: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (uiState.sidebarOpen) return
    if (uiState.rightPanelOpen) return
    const touch = e.touches[0]
    const startX = touchStartXRef.current
    const startY = touchStartYRef.current
    if (startX == null || startY == null) return
    const dx = touch.clientX - startX
    const dy = Math.abs(touch.clientY - startY)
    if (!draggingRef.current) {
      // Start dragging when horizontal movement dominates and is significant
      if (dx > 10 && dx > dy) {
        draggingRef.current = true
        setIsDraggingSidebar(true)
      } else {
        return
      }
    }
    const clamped = Math.max(0, Math.min(dx, uiState.sidebarWidth))
    setDragX(clamped)
  }

  const endDrag = (commitOpen: boolean) => {
    setIsDraggingSidebar(false)
    setDragX(0)
    draggingRef.current = false
    touchStartXRef.current = null
    touchStartYRef.current = null
    uiState.setSidebarOpen(!!commitOpen)
  }

  const onTouchEndEdge: React.TouchEventHandler<HTMLDivElement> = () => {
    if (!isDraggingSidebar) return
    const shouldOpen = dragX > uiState.sidebarWidth * 0.3
    endDrag(shouldOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground"></div>
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
                className="text-xs text-muted-foreground hover:underline text-left hidden"
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
            <div className="text-xs text-muted-foreground text-center">Or</div>
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
              className="text-xs text-muted-foreground hover:underline w-full text-center hidden"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // Sidebar overlay element (mobile only)
  const sidebarOverlay = (() => {
    const openProgress = uiState.isMobile
      ? isDraggingSidebar
        ? Math.max(0, Math.min(1, dragX / uiState.sidebarWidth))
        : uiState.sidebarOpen
          ? 1
          : 0
      : 0
    if (openProgress <= 0) return null
    // sidebar backdrop
    return (
      <div
        className="md:hidden absolute inset-0 bg-black z-40"
        style={{
          opacity: 0.5 * openProgress,
          transition: isDraggingSidebar ? "none" : "opacity 300ms ease-in-out",
          pointerEvents: uiState.sidebarOpen ? "auto" : "none",
        }}
        onClick={() => false && uiState.sidebarOpen && uiState.setSidebarOpen(false)}
        onTouchStart={(e) => {
          if (!uiState.isMobile || !uiState.sidebarOpen) return
          const t = e.touches[0]
          closeStartXRef.current = t.clientX
          closeStartYRef.current = t.clientY
          setIsDraggingSidebar(false)
          setDragX(uiState.sidebarWidth)
          setDragStartTime(Date.now())
        }}
        onTouchMove={(e) => {
          if (!uiState.isMobile || !uiState.sidebarOpen) return
          const sx = closeStartXRef.current
          const sy = closeStartYRef.current
          if (sx == null || sy == null) return
          const t = e.touches[0]
          const dx = t.clientX - sx // negative when swiping left
          const dy = Math.abs(t.clientY - sy)
          if (!isDraggingSidebar) {
            if (dx < -10 && Math.abs(dx) > dy) {
              setIsDraggingSidebar(true)
            } else {
              return
            }
          }
          const next = Math.max(0, Math.min(uiState.sidebarWidth + dx, uiState.sidebarWidth))
          setDragX(next)
        }}
        onTouchEnd={() => {
          if (!isDraggingSidebar && dragStartTime && Date.now() - dragStartTime < 200) {
            setTimeout(()=>{
              endDrag(false)
              closeStartXRef.current = null
              closeStartYRef.current = null
            }, 100);
            return
          }
          if (!isDraggingSidebar) return
          const shouldRemainOpen = dragX > uiState.sidebarWidth * 0.7
          endDrag(shouldRemainOpen)
          closeStartXRef.current = null
          closeStartYRef.current = null
        }}
      />
    )
  })()

  return (
    <ThemeProvider>
      <div
        className={
          floatingMode
            ? "min-h-screen w-full bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.08),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(56,189,248,0.08),transparent_60%)] flex items-center justify-center p-3 md:p-6"
            : "min-h-screen w-full bg-background"
        }
      >
        <div
          className={
            floatingMode
              ? "relative w-full max-w-7xl max-h-[50rem] h-[85vh] md:h-[88vh] rounded-2xl bg-card/95 ring-1 ring-border/50 shadow-2xl overflow-hidden"
              : "relative w-full h-screen md:h-screen bg-background overflow-hidden"
          }
        >
        {sidebarOverlay}

        {uiState.isMobile && <div className="absolute inset-0 w-full h-full" style={{
          backgroundImage: "url(/bg.png)",
          backgroundPosition: "left 50%",
          opacity: 0.4,
        }}>
        </div>}

        <div
          ref={uiState.sidebarRef}
          className={`
          absolute md:relative inset-y-0 left-0 z-50 md:z-1 h-full transform md:translate-x-0
        `}
          style={{
            width: `${uiState.sidebarWidth}px`,
            transform: uiState.isMobile
              ? `translateX(${isDraggingSidebar ? -uiState.sidebarWidth + dragX : uiState.sidebarOpen ? 0 : -uiState.sidebarWidth}px)`
              : undefined,
            transition: isDraggingSidebar ? "none" : "transform 300ms ease-in-out",
          }}
          onTouchStart={(e) => {
            if (!uiState.isMobile || !uiState.sidebarOpen) return
            const t = e.touches[0]
            closeStartXRef.current = t.clientX
            closeStartYRef.current = t.clientY
            setIsDraggingSidebar(false)
            setDragX(uiState.sidebarWidth)
            setDragStartTime(Date.now())
          }}
          onTouchMove={(e) => {
            if (!uiState.isMobile || !uiState.sidebarOpen) return
            const sx = closeStartXRef.current
            const sy = closeStartYRef.current
            if (sx == null || sy == null) return
            const t = e.touches[0]
            const dx = t.clientX - sx
            const dy = Math.abs(t.clientY - sy)
            if (!isDraggingSidebar) {
              if (dx < -10 && Math.abs(dx) > dy) {
                setIsDraggingSidebar(true)
              } else {
                return
              }
            }
            const next = Math.max(0, Math.min(uiState.sidebarWidth + dx, uiState.sidebarWidth))
            setDragX(next)
          }}
          onTouchEnd={() => {
            if (!isDraggingSidebar && dragStartTime && Date.now() - dragStartTime < 200) {
              console.log("close")
              endDrag(false)
              closeStartXRef.current = null
              closeStartYRef.current = null
              return
            }

            if (!isDraggingSidebar) return
            const shouldRemainOpen = dragX > uiState.sidebarWidth * 0.7
            endDrag(shouldRemainOpen)
            closeStartXRef.current = null
            closeStartYRef.current = null
          }}
        >
          <TodoSidebar
            activeList={appState.activeList}
            setActiveList={(list) => {
              appState.setActiveList(list)
              uiState.setSidebarOpen(false)
              if (list === "reliability" || list === "home") {
                uiState.setRightPanelOpen(false)
              }
            }}
            todoCounts={todoCounts}
            isMobile={uiState.isMobile}
          />

          <div
            className="hidden md:block absolute right-0 top-0 bottom-0 w-1 bg-none hover:bg-foreground/20 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
          />
        </div>

        <div className="h-full flex absolute top-0 left-0 w-full">
          {/* Sidebar spacer to keep main content centered to the right of sidebar */}
          <div className="hidden md:block shrink-0" style={{ width: `${uiState.sidebarWidth}px` }} />

        <div
          className={`flex-1 flex h-full pr-safe ${
            uiState.rightPanelOpen &&
            appState.activeList !== "home" &&
            (appState.selectedTodo || appState.selectedRoutineId)
              ? "md:mr-80"
              : ""
          }`}
        >
            {appState.activeList === "reliability" ? (
              <div className="flex-1 flex flex-col min-h-0 relative">
                <ReliabilityChartPage onMenuClick={handleMenuClick} />
              </div>
            ) : appState.activeList === "home" ? (
              <div className="flex-1 flex flex-col min-h-0 relative">
              <HomeDex
                onMenuClick={handleMenuClick}
                onAddTask={(text, amount, currency, instructions, dueDate) =>
                  todoOps.addTodo(text, "today", amount, currency, instructions, dueDate)
                }
                onAddRoutine={(name, type, amount, currency, maxAbs, instructions, endDate) =>
                  routineOps.addRoutine(name, type, amount, currency, maxAbs, instructions, endDate)
                }
              />
              </div>
            ) : (
              <CombinedMain
                activeList={appState.activeList}
                // todos
                todos={filteredTodos}
                addTodoWithMeta={(text, stakeAmount, stakeCurrency, proverInstructions) =>
                  todoOps.addTodo(text, appState.activeList, stakeAmount, stakeCurrency, proverInstructions)
                }
                toggleTodo={todoOps.toggleTodo}
                deleteTodo={todoOps.deleteTodo}
                toggleStar={todoOps.toggleStar}
                onSelectTodo={selectionState.selectTodo}
                selectedTodoId={appState.selectedTodo?.id}
                onDeselectTodo={selectionState.closeRightPanel}
                onMenuClick={handleMenuClick}
                // routines
                routines={routineOps.routines}
                addRoutine={routineOps.addRoutine}
                toggleRoutine={routineOps.toggleRoutine}
                toggleRoutineStar={routineOps.toggleStar}
                selectedRoutineId={appState.selectedRoutineId}
                onSelectRoutine={selectionState.selectRoutine}
              />
            )}
          </div>

        {uiState.rightPanelOpen &&
          appState.activeList !== "reliability" &&
          appState.activeList !== "home" &&
          (appState.selectedTodo || appState.selectedRoutineId) && (
          <div className="absolute right-0 top-0 bottom-0 z-30">
            {uiState.isMobile && (
              <div
                className="fixed top-0 left-0 w-full h-full bg-black z-0"
                style={{
                  touchAction: "none",
                  opacity: isDraggingRightPanel
                    ? Math.max(0, Math.min(0.5, 0.5 * (1 - rightDragX / RIGHT_PANEL_WIDTH)))
                    : isClosingRightPanel
                      ? 0
                      : 0.5,
                  transition: isDraggingRightPanel ? "none" : "opacity 300ms ease-in-out",
                }}
                onClick={() => {
                  if (!uiState.isMobile || isClosingRightPanel) return
                  setIsClosingRightPanel(true)
                  setRightDragX(RIGHT_PANEL_WIDTH)
                }}
                onTouchStart={(e) => {
                  if (!uiState.isMobile) return
                  const t = e.touches[0]
                  panelStartXRef.current = t.clientX
                  panelStartYRef.current = t.clientY
                }}
                onTouchMove={(e) => {
                  if (!uiState.isMobile) return
                  const sx = panelStartXRef.current
                  const sy = panelStartYRef.current
                  if (sx == null || sy == null) return
                  const t = e.touches[0]
                  const dx = t.clientX - sx
                  const dy = Math.abs(t.clientY - sy)
                  if (!isDraggingRightPanel) {
                    if (dx > 10 && dx > dy) {
                      setIsDraggingRightPanel(true)
                    } else {
                      return
                    }
                  }
                  const next = Math.max(0, Math.min(dx, RIGHT_PANEL_WIDTH))
                  setRightDragX(next)
                }}
                onTouchEnd={() => {
                  if (!uiState.isMobile || !isDraggingRightPanel) return
                  const shouldClose = rightDragX > RIGHT_PANEL_WIDTH * 0.3
                  setIsDraggingRightPanel(false)
                  if (shouldClose) {
                    setIsClosingRightPanel(true)
                    setRightDragX(RIGHT_PANEL_WIDTH)
                    setTimeout(()=>{
                      setIsClosingRightPanel(false)
                      selectionState.closeRightPanel()
                      setRightDragX(0)
                    }, 300);
                  } else {
                    setRightDragX(0)
                  }
                  panelStartXRef.current = null
                  panelStartYRef.current = null
                }}
              />
            )}
            <div
              className="relative h-full z-10"
              style={{
                transform: `translateX(${(isDraggingRightPanel || isClosingRightPanel) ? rightDragX : 0}px)`,
                transition: isDraggingRightPanel ? "none" : "transform 300ms ease-in-out",
                touchAction: "pan-y",
              }}
              onTransitionEnd={() => {
                console.log("transition end", isClosingRightPanel, rightDragX, RIGHT_PANEL_WIDTH)
                if (isClosingRightPanel && rightDragX === RIGHT_PANEL_WIDTH) {
                  setIsClosingRightPanel(false)
                  selectionState.closeRightPanel()
                  setRightDragX(0)
                }
              }}
              onTouchStart={(e) => {
                if (!uiState.isMobile) return
                const t = e.touches[0]
                panelStartXRef.current = t.clientX
                panelStartYRef.current = t.clientY
              }}
              onTouchMove={(e) => {
                if (!uiState.isMobile) return
                const sx = panelStartXRef.current
                const sy = panelStartYRef.current
                if (sx == null || sy == null) return
                const t = e.touches[0]
                const dx = t.clientX - sx
                const dy = Math.abs(t.clientY - sy)
                if (!isDraggingRightPanel) {
                  if (dx > 10 && dx > dy) {
                    setIsDraggingRightPanel(true)
                  } else {
                    return
                  }
                }
                const next = Math.max(0, Math.min(dx, RIGHT_PANEL_WIDTH))
                setRightDragX(next)
              }}
              onTouchEnd={() => {
                if (!uiState.isMobile || !isDraggingRightPanel) return
                const shouldClose = rightDragX > RIGHT_PANEL_WIDTH * 0.3
                setIsDraggingRightPanel(false)
                if (shouldClose) {
                  setIsClosingRightPanel(true)
                  setRightDragX(RIGHT_PANEL_WIDTH)
                  setTimeout(()=>{
                    setIsClosingRightPanel(false)
                    selectionState.closeRightPanel()
                    setRightDragX(0)
                  }, 300);
                } else {
                  setRightDragX(0)
                }
                panelStartXRef.current = null
                panelStartYRef.current = null
              }}
            >
              {/* Gesture handle to close: swipe left->right */}
              <div
                className="absolute inset-y-0 left-0 w-6 z-10"
                style={{ touchAction: "none" }}
                onTouchStart={(e) => {
                  if (!uiState.isMobile) return
                  const t = e.touches[0]
                  panelStartXRef.current = t.clientX
                  panelStartYRef.current = t.clientY
                }}
                onTouchMove={(e) => {
                  if (!uiState.isMobile) return
                  const sx = panelStartXRef.current
                  const sy = panelStartYRef.current
                  if (sx == null || sy == null) return
                  const t = e.touches[0]
                  const dx = t.clientX - sx
                  const dy = Math.abs(t.clientY - sy)
                  if (!isDraggingRightPanel) {
                    if (dx > 10 && dx > dy) {
                      setIsDraggingRightPanel(true)
                    } else {
                      return
                    }
                  }
                  const RIGHT_PANEL_WIDTH = 320
                  const next = Math.max(0, Math.min(dx, RIGHT_PANEL_WIDTH))
                  setRightDragX(next)
                }}
                onTouchEnd={() => {
                  if (!uiState.isMobile || !isDraggingRightPanel) return
                  const RIGHT_PANEL_WIDTH = 320
                  const shouldClose = rightDragX > RIGHT_PANEL_WIDTH * 0.3
                  setIsDraggingRightPanel(false)
                  setRightDragX(0)
                  panelStartXRef.current = null
                  panelStartYRef.current = null
                  if (shouldClose) selectionState.closeRightPanel()
                }}
              />
              {appState.selectedTodo ? (
                <TodoDetailPanel
                  todo={todoOps.todos.find((t) => t.id === appState.selectedTodo?.id) || appState.selectedTodo}
                  onClose={selectionState.closeRightPanel}
                  onUpdate={todoOps.updateTodo}
                  onDelete={todoOps.deleteTodo}
                  onToggle={todoOps.toggleTodo}
                  animated={uiState.isMobile}
                />
              ) : appState.selectedRoutineId ? (
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
                  animated={uiState.isMobile}
                  // Default detail type to the routine's own type; fallback daily
                  type={
                    (appState.selectedRoutineId
                      ? (routineOps.routines.find((r) => r.id === appState.selectedRoutineId)?.type as
                          | "daily"
                          | "weekly"
                          | "monthly"
                          | undefined)
                      : undefined) || "daily"
                  }
                />
              ) : null}
            </div>
          </div>
        )}
        </div>
        </div>

        {/* Mobile edge swipe area to open sidebar */}
        <div
          className="md:hidden fixed inset-y-0 left-0 z-30"
          style={{ width: 24, touchAction: "none" }}
          onTouchStart={onTouchStartEdge}
          onTouchMove={onTouchMoveEdge}
          onTouchEnd={onTouchEndEdge}
          onTouchCancel={onTouchEndEdge}
          hidden={uiState.rightPanelOpen}
        />
      </div>
    </ThemeProvider>
  )
}
