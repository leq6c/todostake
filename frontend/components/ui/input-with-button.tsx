"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface InputWithButtonProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  buttonText: string
  buttonIcon?: React.ReactNode
  disabled?: boolean
  type?: string
  className?: string
}

export function InputWithButton({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonText,
  buttonIcon,
  disabled = false,
  type = "text",
  className = "",
}: InputWithButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit()
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-none focus-visible:border-none focus:border-none outline-none"
      />
      <Button onClick={onSubmit} disabled={disabled || !value.trim()} size="sm">
        {buttonIcon && <span className="h-4 w-4 mr-1">{buttonIcon}</span>}
        {buttonText}
      </Button>
    </div>
  )
}
