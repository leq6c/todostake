"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileHeader } from "@/components/ui/mobile-header"
import { PageHeader } from "@/components/ui/page-header"
import { ActionButton } from "@/components/ui/action-button"
import { Clock, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"

interface HomeDexProps {
  onAddTask: (
    text: string,
    stakeAmount?: number,
    stakeCurrency?: string,
    instructions?: string,
    dueDate?: Date,
  ) => void
  onAddRoutine: (
    name: string,
    type: "daily" | "weekly" | "monthly",
    stakeAmount?: number,
    stakeCurrency?: string,
    maxAbsence?: number,
    instructions?: string,
    endDate?: Date,
  ) => void
  onMenuClick?: () => void
}

export function HomeDex({ onAddTask, onAddRoutine, onMenuClick }: HomeDexProps) {
  const [type, setType] = useState<"task" | "daily" | "weekly" | "monthly">("task")
  const [text, setText] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [stakeCurrency, setStakeCurrency] = useState("SOL")
  const [instructions, setInstructions] = useState("")
  const [maxAbsence, setMaxAbsence] = useState("")
  const unitLabel = type === "task" ? "days" : type === "weekly" ? "weeks" : type === "monthly" ? "months" : "days"
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const {profile} = useProfile()

  const submit = () => {
    if (!text.trim()) return
    if (type === "task") {
      const amt = Number.parseFloat(stakeAmount)
      onAddTask(
        text.trim(),
        isNaN(amt) || amt <= 0 ? undefined : amt,
        stakeCurrency,
        instructions.trim() || undefined,
        selectedDueDate ?? undefined,
      )
    } else {
      const amt = Number.parseFloat(stakeAmount)
      const maxAbs = Number.parseInt(maxAbsence)
      onAddRoutine(
        text.trim(),
        type,
        isNaN(amt) || amt <= 0 ? undefined : amt,
        stakeCurrency,
        isNaN(maxAbs) || maxAbs <= 0 ? undefined : maxAbs,
        instructions.trim() || undefined,
        selectedEndDate ?? undefined,
      )
    }
    setText("")
    setStakeAmount("")
    setInstructions("")
    setMaxAbsence("")
    setSelectedDueDate(null)
    setShowDatePicker(false)
    setSelectedEndDate(null)
    setShowEndDatePicker(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col">
        <div className="mt-6 p-3 md:p-4 px-0 mt-safe">
          <PageHeader
            title="Home"
            onMenuClick={onMenuClick}
          />
        </div>
        {/* Centered DEX-like panel (mobile-friendly) */}
        <div className="w-full h-full flex justify-start items-stretch md:items-center mt-4 md:mt-18 flex-col px-1">
          {/* Type toggle */}
          <div className="flex items-center gap-2 mb-4 flex-wrap justify-center md:justify-start">
            {(["task", "daily", "weekly", "monthly"] as const).map((t) => (
              <Button
                key={t}
                variant={type === t ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <div className="w-full max-w-xl md:max-w-2xl rounded-2xl p-5 md:p-6 shadow-2xl bg-card/95 ring-1 ring-border/50">

            {/* Top box */}
            <div className="rounded-xl bg-card/95 backdrop-blur-md p-4">
              <div className="text-xs text-foreground mb-2">{type === "task" ? "Task" : `${type.charAt(0).toUpperCase() + type.slice(1)} Routine`}</div>
              <Input
                placeholder={type === "task" ? "What do you want to do?" : "Routine name"}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="h-12 text-base border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Bottom box */}
            <div className="rounded-xl bg-card/95 backdrop-blur-md p-4 space-y-3 flex flex-col md:flex-row gap-3 pt-0">
              <div className={"w-full md:w-auto" + (profile?.walletConnected ? "" : " hidden")}>
                <div className="text-xs text-foreground mb-1">Stake</div>
                <div className="flex flex-row gap-2 items-center">
                  <Input
                    placeholder="0.00"
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-28 h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <Select value={stakeCurrency} onValueChange={setStakeCurrency}>
                    <SelectTrigger className="w-24 h-10 border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOL">SOL</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="gap-2">
                {type === "task" && (
                  <div className="space-y-2 relative">
                    <div className="text-xs text-foreground mb-1">Due date</div>
                    {selectedDueDate ? (
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border/50">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Due {selectedDueDate.toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => setSelectedDueDate(null)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <ActionButton className="mb-0" icon={<Clock className="h-4 w-4" />} onClick={() => setShowDatePicker(true)}>
                        Add due date
                      </ActionButton>
                    )}

                        {showDatePicker && (
                      <div className="absolute z-50 top-full left-0 mt-2 w-72 max-w-[90vw] md:w-80 p-4 border border-border rounded-lg bg-card shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <h4 className="font-medium">
                            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="h-6 flex items-center justify-center font-medium">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {renderCalendar(currentDate, (date) => {
                            setSelectedDueDate(date)
                            setShowDatePicker(false)
                          })}
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => setShowDatePicker(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {type !== "task" && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-foreground mb-1">End date</div>
                      <div className="space-y-2 relative">
                        {selectedEndDate ? (
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border/50">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">Until {selectedEndDate.toLocaleDateString()}</span>
                            </div>
                            <button
                              onClick={() => setSelectedEndDate(null)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <ActionButton icon={<Clock className="h-4 w-4" />} onClick={() => setShowEndDatePicker(true)}>
                            Set end date
                          </ActionButton>
                        )}

                        {showEndDatePicker && (
                          <div className="absolute z-50 top-full left-0 mt-2 w-72 max-w-[90vw] md:w-80 p-4 border border-border rounded-lg bg-card shadow-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <h4 className="font-medium">
                                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                              </h4>
                              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                <div key={day} className="h-6 flex items-center justify-center font-medium">
                                  {day}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {renderCalendar(currentDate, (date) => {
                                setSelectedEndDate(date)
                                setShowEndDatePicker(false)
                              })}
                            </div>
                            <div className="flex justify-end">
                              <Button size="sm" variant="outline" onClick={() => setShowEndDatePicker(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile?.walletConnected && <div>
                      <div className="text-xs text-foreground mb-1">Maximum Absence ({unitLabel})</div>
                      <Input
                      placeholder={unitLabel === "days" ? "e.g. 7" : unitLabel === "weeks" ? "e.g. 4" : "e.g. 2"}
                      type="number"
                      value={maxAbsence}
                      onChange={(e) => setMaxAbsence(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      className="h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
                      />
                    </div>}
                  </div>
                )}
              </div>

              {!profile?.walletConnected && type !== "task" && (<div>
                <div className="text-xs text-foreground mb-1">Maximum Absence ({unitLabel})</div>
                <Input
                placeholder={unitLabel === "days" ? "e.g. 7" : unitLabel === "weeks" ? "e.g. 4" : "e.g. 2"}
                type="number"
                value={maxAbsence}
                onChange={(e) => setMaxAbsence(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>)}

              <div className="flex-1"></div>

              <div className="pt-4">
                <Button className="w-full h-11 shadow-md" onClick={submit}>
                  {type === "task" ? "Create" : `Create`}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-8 hidden">Keep your word or lose your stake.</p>
        </div>
      </div>
    </div>
  )
}
// Calendar helpers
function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}
function renderCalendar(currentDate: Date, onSelect: (d: Date) => void) {
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const today = new Date()
  const cells: JSX.Element[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-8" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const isToday = date.toDateString() === today.toDateString()
    cells.push(
      <button
        key={day}
        className={`h-8 text-xs rounded hover:bg-muted transition-colors ${isToday ? "bg-muted text-foreground" : ""}`}
        onClick={() => onSelect(date)}
      >
        {day}
      </button>,
    )
  }
  return cells
}
