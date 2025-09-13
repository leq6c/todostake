"use client"

import { useMemo, useState } from "react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { MobileHeader } from "@/components/ui/mobile-header"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useReliabilityScore } from "@/hooks/use-reliability-score"
import { toast } from "@/hooks/use-toast"

interface ReliabilityChartPageProps {
  onMenuClick?: () => void
}

export function ReliabilityChartPage({ onMenuClick }: ReliabilityChartPageProps) {
  const { currentScore, reliabilityHistory, getScoreColor, getScoreBadge, resetMetrics } = useReliabilityScore()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    // Map latest score per date
    const scoreByDate = new Map<string, number>()
    for (const entry of reliabilityHistory) {
      if (!scoreByDate.has(entry.date)) {
        scoreByDate.set(entry.date, entry.score)
      }
    }
    const out: { date: string; score: number }[] = []
    const today = new Date()
    let prevScore = currentScore
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const s = scoreByDate.get(dateStr)
      const useScore = typeof s === "number" ? s : prevScore
      out.push({ date: dateStr, score: useScore })
      prevScore = useScore
    }
    return out
  }, [reliabilityHistory, timeRange, currentScore])

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
      <div className="mt-6 p-3 md:p-4">
        <PageHeader title="Reliability" onMenuClick={onMenuClick} />
      </div>

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
              <div className="flex gap-1 items-center">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-destructive"
                  onClick={async () => {
                    if (confirm("Reset reliability metrics? This will clear history and set score to 87.")) {
                      await resetMetrics()
                      toast({
                        title: "Metrics reset",
                        description: "History cleared and score set to 87.",
                      })
                    }
                  }}
                >
                  Reset
                </Button>
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
                    domain={[0, 100]}
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
