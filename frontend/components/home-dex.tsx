"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileHeader } from "@/components/ui/mobile-header"
import { PageHeader } from "@/components/ui/page-header"

interface HomeDexProps {
  onAddTask: (text: string, stakeAmount?: number, stakeCurrency?: string, instructions?: string) => void
  onAddRoutine: (
    name: string,
    type: "daily" | "weekly" | "monthly",
    stakeAmount?: number,
    stakeCurrency?: string,
    maxAbsence?: number,
    instructions?: string,
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

  const submit = () => {
    if (!text.trim()) return
    if (type === "task") {
      const amt = Number.parseFloat(stakeAmount)
      onAddTask(text.trim(), isNaN(amt) || amt <= 0 ? undefined : amt, stakeCurrency, instructions.trim() || undefined)
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
      )
    }
    setText("")
    setStakeAmount("")
    setInstructions("")
    setMaxAbsence("")
  }

  return (
    <div className="h-full flex flex-col">
      <MobileHeader title="Home" onMenuClick={onMenuClick} />
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Centered DEX-like panel */}
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-full max-w-xl md:max-w-2xl rounded-2xl p-5 md:p-6 shadow-2xl bg-card/95 ring-1 ring-border/50">
            {/* Type toggle */}
            <div className="flex items-center gap-2 mb-4">
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

            {/* Middle pinky-swear icon */}
            <div className="flex items-center justify-center py-3">
              <div className="h-10 w-10 rounded-full bg-muted/60 text-foreground flex items-center justify-center shadow">
                {/* Simple pinky-swear svg */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 12c2 0 2-4 4-4s2 4 4 4" />
                  <path d="M7 12c2 0 2 4 4 4s2-4 4-4" />
                  <path d="M5 12h14" />
                </svg>
              </div>
            </div>

            {/* Bottom box */}
            <div className="rounded-xl bg-card/95 backdrop-blur-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground">Stake</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-foreground mb-1">Instructions</div>
                  <Input
                    placeholder="Define proof conditions (optional)"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {type !== "task" && (
                  <div>
                    <div className="text-xs text-foreground mb-1">Maximum Absence (days)</div>
                    <Input
                      placeholder="e.g. 7"
                      type="number"
                      value={maxAbsence}
                      onChange={(e) => setMaxAbsence(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      className="h-10 text-sm border-0 focus:ring-0 focus-visible:ring-0 bg-muted/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full h-11 shadow-md" onClick={submit}>
                {type === "task" ? "Create Task" : `Create ${type.charAt(0).toUpperCase() + type.slice(1)} Routine`}
              </Button>
            </div>

            {/* Recent tasks intentionally hidden per request */}
          </div>
        </div>
      </div>
    </div>
  )
}
