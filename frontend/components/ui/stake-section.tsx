"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare } from "lucide-react"
import { ActionButton } from "@/components/ui/action-button"

interface StakeSectionProps {
  currentStakeAmount?: number
  currentCurrency?: string
  onStakeSubmit: (amount: number, currency: string) => void
  onAddInstructions: (event: React.MouseEvent<HTMLButtonElement>) => void
  proverInstructions?: string
  description?: string
}

export function StakeSection({
  currentStakeAmount,
  currentCurrency = "SOL",
  onStakeSubmit,
  onAddInstructions,
  proverInstructions,
  description = "Put money on the line to commit to completing this task",
}: StakeSectionProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency)

  const handleStakeSubmit = () => {
    const amount = Number.parseFloat(stakeAmount)
    if (amount > 0) {
      onStakeSubmit(amount, selectedCurrency)
      setStakeAmount("")
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Stake</label>
      <p className="text-xs text-muted-foreground">{description}</p>

      <div className="flex gap-2">
        <Input
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.00"
          type="number"
          className="flex-1 border-none focus-visible:border-none focus:border-none outline-none"
        />

        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-20 border-none focus-visible:border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOL">SOL</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleStakeSubmit}
          disabled={!stakeAmount || Number.parseFloat(stakeAmount) <= 0}
          className={stakeAmount && stakeAmount != "0" ? "w-auto px-3" : "w-0 px-0"}
          style={{
            opacity: stakeAmount && stakeAmount != "0" ? 1 : 0,
          }}
        >
          Stake
        </Button>
      </div>

      {currentStakeAmount && (
        <div className="text-sm text-green-600 dark:text-green-400">
          Current stake: {currentStakeAmount} {currentCurrency}
        </div>
      )}

      {/* Prover Instruction */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-sm font-medium text-foreground">Prover Instruction</label>
        <p className="text-xs text-muted-foreground">
          Add instructions to tighten conditions and avoid cheating by future you
        </p>
        <div className="relative">
          <ActionButton icon={<MessageSquare className="h-4 w-4" />} onClick={onAddInstructions} variant="outline">
            Add Instructions
          </ActionButton>
        </div>

        {proverInstructions && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border/50">
            <p className="text-xs text-foreground">{proverInstructions}</p>
          </div>
        )}
      </div>
    </div>
  )
}
