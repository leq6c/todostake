"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileHeaderProps {
  title: string
  onMenuClick?: () => void
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </div>
  )
}
