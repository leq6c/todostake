import type { StreakData } from "@/types"

interface StreakVisualizationProps {
  streakData: StreakData[]
  maxAbsence?: number
  className?: string
}

export function StreakVisualization({ streakData, maxAbsence, className = "" }: StreakVisualizationProps) {
  const getSquareColor = (data: StreakData, index: number) => {
    // Completed days are always green
    if (data.completed) return "bg-green-500 dark:bg-green-600"

    // For missed days, optionally escalate color when absence exceeds threshold
    if (typeof maxAbsence === "number" && maxAbsence > 0) {
      // Count consecutive misses ending at this index
      let consecutiveMisses = 0
      for (let i = index; i >= 0; i--) {
        if (streakData[i].completed) break
        consecutiveMisses++
        if (consecutiveMisses >= maxAbsence) break
      }
      if (consecutiveMisses >= maxAbsence) return "bg-red-500 dark:bg-red-700"
    }

    // Default missed day color
    return "bg-gray-300 dark:bg-gray-600"
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {/* if streakData.length < 16, add leading empty squares */}
      {streakData.length < 16 && (
        Array.from({ length: 16 - streakData.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-3 h-3 min-w-3 min-h-3 rounded-sm bg-gray-300 dark:bg-gray-600"
          />
        ))
      )
      }
      {streakData.map((data, index) => (
        <div
          key={data.date}
          className={`w-3 h-3 min-w-3 min-h-3 rounded-sm ${getSquareColor(data, index)} transition-colors`}
          title={`${data.date}: ${data.completed ? "Completed" : "Missed"}`}
        />
      ))}
    </div>
  )
}
