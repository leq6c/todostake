"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckSquare, List, Sun, Moon, TrendingUp, Home as HomeIcon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useModal } from "@/components/providers/modal-provider"
import type { TodoCounts } from "@/types"
import { useAuth } from "@/hooks/use-auth"

interface TodoSidebarProps {
  activeList: string
  setActiveList: (list: string) => void
  todoCounts: TodoCounts
  isMobile: boolean
}

export function TodoSidebar({
  activeList,
  setActiveList,
  todoCounts,
  isMobile,
}: TodoSidebarProps) {
  const { showModal } = useModal()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const [lastTouchTime, setLastTouchTime] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
  }

  const handleAccountClick = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    showModal({
      type: "account",
      position: { x: rect.right + 8, y: rect.top },
      arrowPosition: "left-top",
    })
  }

  const handleEvents = (fn: () => void, event: React.MouseEvent | React.TouchEvent) => {
    if (event.type === "click") {
      if (lastTouchTime && Date.now() - lastTouchTime < 300) {
        return;
      }
      setLastTouchTime(Date.now())
      fn()
    } else {
      setLastTouchTime(Date.now())
      fn()
    }
  };

  const defaultLists = [
    { id: "home", name: "Home", icon: HomeIcon, count: 0 },
    { id: "today", name: "Today", icon: Calendar, count: todoCounts.today },
    { id: "planned", name: "Planned", icon: CheckSquare, count: todoCounts.planned },
    { id: "tasks", name: "All Tasks", icon: List, count: todoCounts.tasks },
  ]

  return (
    <div className="w-full bg-sidebar border-r border-sidebar-border/70 flex flex-col h-full pl-safe">
      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border/70 mt-safe">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
          onClick={(e) => handleEvents(() => handleAccountClick(e), e)}
          onTouchStart={(e) => handleEvents(() => handleAccountClick(e), e)}
        >
          <Avatar className="h-10 w-10 md:h-8 md:w-8">
            <AvatarFallback className="bg-foreground text-background font-medium text-base md:text-sm">
              {(user?.displayName || user?.email || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sidebar-foreground truncate text-base md:text-sm">{user?.displayName || (user?.isAnonymous ? "Guest" : "User")}</p>
            <p className="text-sm md:text-xs text-muted-foreground truncate">{user?.isAnonymous ? "Guest" : user?.email || "Signed in"}</p>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-b border-sidebar-border/70">
        <div className="flex items-center gap-2 md:gap-1">
          {mounted && (
            <>
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                onTouchStart={(e) => handleEvents(() => handleThemeChange("light"), e)}
                onClick={(e) => handleEvents(() => handleThemeChange("light"), e)}
                className="flex-1 h-10 md:h-8"
              >
                <Sun className="h-5 w-5 md:h-3 md:w-3" />
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                onTouchStart={(e) => handleEvents(() => handleThemeChange("dark"), e)}
                onClick={(e) => handleEvents(() => handleThemeChange("dark"), e)}
                className="flex-1 h-10 md:h-8"
              >
                <Moon className="h-5 w-5 md:h-3 md:w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Default Lists */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2 md:space-y-1">
          {defaultLists.map((list) => {
            const Icon = list.icon
            return (
              <Button
                key={list.id}
                variant={activeList === list.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 md:gap-2 h-12 md:h-8 text-base md:text-sm hover:bg-muted/30"
                onTouchStart={(e) => handleEvents(() => setActiveList(list.id), e)}
                onClick={(e) => handleEvents(() => setActiveList(list.id), e)}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="flex-1 text-left">{list.name}</span>
                {list.count > 0 && (
                  <Badge variant="secondary" className="ml-auto text-sm md:text-xs">
                    {list.count}
                  </Badge>
                )}
              </Button>
            )
          })}

          <Button
            variant={activeList === "reliability" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3 md:gap-2 h-12 md:h-8 text-base md:text-sm hover:bg-muted/30 hidden"
            onTouchStart={(e) => handleEvents(() => setActiveList("reliability"), e)}
            onClick={(e) => handleEvents(() => setActiveList("reliability"), e)}
          >
            <TrendingUp className="h-5 w-5 md:h-4 md:w-4" />
            <span className="flex-1 text-left">Score</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
