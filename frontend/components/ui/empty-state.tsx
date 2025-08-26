"use client"

import type React from "react"

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon = "✨", title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}
