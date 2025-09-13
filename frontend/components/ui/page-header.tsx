"use client"

import type React from "react"
import { Button } from "./button"
import { Menu } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
  onMenuClick?: () => void
}

export function PageHeader({ title, subtitle, icon, className = "", onMenuClick }: PageHeaderProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-1 justify-center relative">
        {icon}
        <h1 className="text-xl md:text-2xl text-foreground mb-1 font-medium">{title}</h1>
        <div className={"md:hidden absolute left-0 " + (title === "Home" ? "top-[-0.3em]" : "top-1.5")}>
          <Button
            variant="ghost"
            size="lg"
            onClick={onMenuClick}
            className="backdrop-blur-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {subtitle && <p className="text-muted-foreground justify-center text-center text-sm w-full">{subtitle}</p>}
    </div>
  )
}
