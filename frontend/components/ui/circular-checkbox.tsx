"use client"

import type React from "react"

import { Check } from "lucide-react"

interface CircularCheckboxProps {
  checked: boolean
  onClick: (e: React.MouseEvent) => void
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "danger"
}

export function CircularCheckbox({
  checked,
  onClick,
  className = "",
  size = "md",
  variant = "default",
}: CircularCheckboxProps) {
  const borderColor = variant === "danger" ? "border-red-500 dark:border-red-400" : "border-foreground"

  const bgColor =
    variant === "danger" && checked ? "bg-red-500 dark:bg-red-400" : checked ? "bg-foreground" : "bg-transparent"

  return (
    <button
      className={`h-5.5 w-5.5 mt-[-1.5px] md:mt-[-1px] md:h-5 md:w-5 rounded-full border-[1.5px] ${borderColor} cursor-pointer flex items-center justify-center transition-colors ${bgColor} ${className}`}
      onClick={onClick}
    >
      {checked && <Check className={`h-3.5 w-3.5 md:h-3 md:w-3 text-background`} />}
    </button>
  );
}
