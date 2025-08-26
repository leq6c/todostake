"use client"

import { useState, useEffect, useRef } from "react"

export function useUIState(activeList?: string) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isResizing, setIsResizing] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1200
      if (isLargeScreen && activeList !== "reliability") {
        setRightPanelOpen(true)
      } else {
        setRightPanelOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeList])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth >= 250 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing])

  return {
    // State
    sidebarOpen,
    sidebarWidth,
    isResizing,
    rightPanelOpen,
    sidebarRef,
    // Actions
    setSidebarOpen,
    setSidebarWidth,
    setIsResizing,
    setRightPanelOpen,
  }
}
