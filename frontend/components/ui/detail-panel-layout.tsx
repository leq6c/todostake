"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trash2 } from "lucide-react"

interface DetailPanelLayoutProps {
  children: React.ReactNode
  onClose: () => void
  onDelete?: () => void
  footerContent?: React.ReactNode
  className?: string
}

export function DetailPanelLayout({
  children,
  onClose,
  onDelete,
  footerContent,
  className = "",
}: DetailPanelLayoutProps) {
  return (
    <div className={`w-80 bg-card/95 border-l border-border/70 flex flex-col h-full shadow-lg ${className}`}>
      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden">{children}</div>

      {/* Footer */}
      <div className="p-4 border-t border-border/70 flex justify-between items-center bg-card/95">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {footerContent && <div className="text-xs text-muted-foreground">{footerContent}</div>}

        {onDelete && (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
