"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

interface ActionButtonProps {
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  variant?: "default" | "outline" | "ghost" | "destructive"
  className?: string
  disabled?: boolean
}

export function ActionButton({
  icon,
  children,
  onClick,
  variant = "outline",
  className = "",
  disabled = false,
}: ActionButtonProps) {
  const baseClasses = "w-full justify-start"
  const variantClasses = {
    default: "",
    outline:
      "bg-background hover:bg-muted border-none text-foreground dark:text-white dark:hover:bg-white/10",
    ghost: "",
    destructive: "text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-transparent",
  }

  return (
    <Button
      variant={variant}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="h-4 w-4 mr-2">{icon}</span>
      {children}
    </Button>
  )
}
