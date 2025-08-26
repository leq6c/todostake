"use client"

interface StatItem {
  label: string
  value: string | number
  suffix?: string
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ stats, columns = 2, className = "" }: StatsGridProps) {
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="text-lg font-semibold">
            {stat.value}
            {stat.suffix}
          </div>
        </div>
      ))}
    </div>
  )
}
