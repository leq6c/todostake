import type { StreakData } from "@/types"

interface StreakVisualizationProps {
  streakData: StreakData[]
  maxAbsence?: number
  className?: string
}

export function StreakVisualization({ streakData, maxAbsence, className = "" }: StreakVisualizationProps) {
  const getSquareColor = (data: StreakData, index: number) => {
    if (maxAbsence) {
      const recentMissed = streakData
        .slice(Math.max(0, index - maxAbsence + 1), index + 1)
        .filter((d) => !d.completed).length

      if (recentMissed >= maxAbsence) {
        return data.completed ? "bg-red-500 dark:bg-red-500" : "bg-red-300 dark:bg-red-700"
      }
    }

    return data.completed ? "bg-green-500 dark:bg-green-600" : "bg-gray-300 dark:bg-gray-800"
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
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
