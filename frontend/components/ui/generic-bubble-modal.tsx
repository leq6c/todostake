"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface GenericBubbleModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  title?: string
  children: React.ReactNode
  width?: string
  height?: string
  arrowPosition?: "right-top" | "right-bottom" | "left-top" | "left-bottom" | "left-center"
  showHeader?: boolean
}

export function GenericBubbleModal({
  isOpen,
  onClose,
  position,
  title,
  children,
  width = "w-80",
  height = "h-auto",
  arrowPosition = "right-bottom",
  showHeader = true,
}: GenericBubbleModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!isOpen) return null

  if (isMobile) {
    return (
      <>
        {/* Transparent black overlay */}
        <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

        {/* Bottom slide-in modal */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-lg shadow-lg z-[9999] flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-300">
          {/* Modal Header */}
          {showHeader && (
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h3 className="font-medium text-foreground text-base">{title}</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Modal Content */}
          <div className="flex-1 overflow-hidden flex flex-col p-4">{children}</div>
        </div>
      </>
    )
  }

  const getArrowClasses = () => {
    switch (arrowPosition) {
      case "right-top":
        return "absolute -right-2 top-4 w-4 h-4 bg-background border-r border-b border-border transform rotate-45"
      case "right-bottom":
        return "absolute -right-2 bottom-6 w-4 h-4 bg-background border-r border-b border-border transform rotate-45"
      case "left-top":
        return "absolute -left-2 top-6 w-4 h-4 bg-background border-l border-t border-border transform rotate-45"
      case "left-bottom":
        return "absolute -left-2 bottom-6 w-4 h-4 bg-background border-l border-t border-border transform rotate-45"
      case "left-center":
        return "absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-l border-t border-border transform rotate-45"
      default:
        return "absolute -right-2 bottom-6 w-4 h-4 bg-background border-r border-b border-border transform rotate-45"
    }
  }

  const getModalPosition = () => {
    const gap = 16
    switch (arrowPosition) {
      case "right-top":
      case "right-bottom":
        return {
          left: position.x - Number.parseInt(width.replace("w-", "")) * 4 - gap,
          bottom: `calc(100vh - ${position.y + 16}px)`,
        }
      case "left-top":
      case "left-bottom":
      case "left-center":
        return {
          left: position.x + gap,
          top: position.y,
        }
      default:
        return {
          left: position.x - Number.parseInt(width.replace("w-", "")) * 4 - gap,
          bottom: `calc(100vh - ${position.y + 16}px)`,
        }
    }
  }

  return (
    <div
      className={`fixed ${width} ${height} bg-background border border-border rounded-lg shadow-lg z-[9999] flex flex-col`}
      style={getModalPosition()}
    >
      <div className={getArrowClasses()}></div>

      {/* Modal Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
          <h3 className="font-medium text-foreground text-sm">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Modal Content */}
      <div className="flex-1 overflow-hidden flex flex-col ">{children}</div>
    </div>
  )
}
