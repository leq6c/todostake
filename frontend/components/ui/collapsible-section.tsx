"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface CollapsibleSectionProps {
  title: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`pt-4 ${className}`}>
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -ml-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-medium text-muted-foreground">
          {title} {count !== undefined && `(${count})`}
        </h3>
      </div>

      {isOpen && <div className="space-y-2 mt-2">{children}</div>}
    </div>
  )
}
