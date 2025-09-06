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
      <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col">
        <PageHeader
          title="Home"
        />
        {/* Centered DEX-like panel */}
        <div className="w-full h-full flex justify-start items-center mt-4 md:mt-18 flex-col">
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
            <div className="rounded-xl bg-card/95 backdrop-blur-md p-4 space-y-3 flex flex-row gap-3 pt-0">
              <div>
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

              <div className="gap-2 flex-1">
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

              <div className="pt-4">
                <Button className="w-full h-11 shadow-md" onClick={submit}>
                  {type === "task" ? "Create" : `Create`}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-8">Keep your word or lose your stake.</p>
        </div>
      </div>
    </div>
  )
}
