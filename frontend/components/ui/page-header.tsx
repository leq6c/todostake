"use client"

import type React from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, icon, className = "" }: PageHeaderProps) {
  return (
    <div className={`p-3 md:p-4 border-b border-border ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h1>
      </div>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
