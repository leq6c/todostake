"use client"

interface StakeBadgeProps {
  amount: number
  variant?: "default" | "success" | "danger"
  size?: "sm" | "md"
  className?: string
}

export function StakeBadge({ amount, variant = "default", size = "sm", className = "" }: StakeBadgeProps) {
  const variantClasses = {
    default: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    danger: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
  }

  return (
    <span className={`font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      ${amount}
    </span>
  )
}
