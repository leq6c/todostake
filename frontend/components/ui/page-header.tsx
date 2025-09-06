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
    <div className={`p-3 md:p-4 ${className} mt-6`}>
      <div className="flex items-center gap-1 justify-center">
        {icon}
        <h1 className="text-xl md:text-2xl text-foreground mb-1 font-medium">{title}</h1>
      </div>
      {subtitle && <p className="text-muted-foreground justify-center text-center text-sm w-full">{subtitle}</p>}
    </div>
  )
}
