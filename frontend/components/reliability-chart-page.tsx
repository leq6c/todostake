"use client"

import { useState } from "react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { MobileHeader } from "@/components/ui/mobile-header"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useReliabilityScore } from "@/hooks/use-reliability-score"

interface ReliabilityChartPageProps {
  onMenuClick?: () => void
}

export function ReliabilityChartPage({ onMenuClick }: ReliabilityChartPageProps) {
  const { currentScore, reliabilityHistory, getScoreColor, getScoreBadge } = useReliabilityScore()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const mockChartData = [
    { date: "2024-01-01", score: 85 },
    { date: "2024-01-02", score: 87 },
    { date: "2024-01-03", score: 82 },
    { date: "2024-01-04", score: 89 },
    { date: "2024-01-05", score: 91 },
    { date: "2024-01-06", score: 88 },
    { date: "2024-01-07", score: 92 },
    { date: "2024-01-08", score: 90 },
    { date: "2024-01-09", score: 94 },
    { date: "2024-01-10", score: 89 },
    { date: "2024-01-11", score: 93 },
    { date: "2024-01-12", score: 95 },
    { date: "2024-01-13", score: 91 },
    { date: "2024-01-14", score: 96 },
    { date: "2024-01-15", score: 94 },
    { date: "2024-01-16", score: 97 },
    { date: "2024-01-17", score: 95 },
    { date: "2024-01-18", score: 98 },
    { date: "2024-01-19", score: 96 },
    { date: "2024-01-20", score: 99 },
    { date: "2024-01-21", score: 97 },
    { date: "2024-01-22", score: 95 },
    { date: "2024-01-23", score: 93 },
    { date: "2024-01-24", score: 96 },
    { date: "2024-01-25", score: 98 },
    { date: "2024-01-26", score: 94 },
    { date: "2024-01-27", score: 97 },
    { date: "2024-01-28", score: 95 },
    { date: "2024-01-29", score: 99 },
    { date: "2024-01-30", score: 97 },
  ]

  const getFilteredHistory = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    return mockChartData.slice(-days)
  }

  const chartData = getFilteredHistory()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-xl">
          <p className="text-xs font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-sm font-semibold">
            <span className={getScoreColor(data.score)}>{data.score}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <MobileHeader title="Reliability" onMenuClick={onMenuClick} />

      <PageHeader title="Reliability" />

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Reliability Score</h3>
          <div className="text-center space-y-3 mt-12">
            <div className="space-y-1">
              <div className="text-5xl font-light">
                <span className="text-gray-600 dark:text-gray-400">{currentScore}</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Score History</h3>
              <div className="flex gap-1">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "ghost"}
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 60, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    axisLine={true}
                    tickLine={true}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    type="category"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis
                    domain={[80, 100]}
                    axisLine={true}
                    tickLine={true}
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    type="number"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={{ r: 2, fill: "#6b7280", strokeWidth: 0 }}
                    activeDot={{ r: 4, stroke: "#6b7280", strokeWidth: 2, fill: "#ffffff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Recent Activity</h3>
          <div className="space-y-1">
            {reliabilityHistory.slice(0, 3).map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`${entry.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {entry.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  </div>
                  <span className="text-sm">{entry.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${entry.change > 0 ? "text-green-500" : "text-red-500"}`}>
                    {entry.change > 0 ? "+" : ""}
                    {entry.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
