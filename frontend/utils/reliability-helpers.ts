import type { Todo, Routine } from "@/types"

export const getTaskCompletionContext = (todo: Todo) => {
  const hasStake = !!(todo.stakeAmount && todo.stakeAmount > 0)
  const isOverdue = !!(todo.dueDate && new Date() > todo.dueDate)

  return {
    hasStake,
    isOverdue,
  }
}

export const getRoutineCompletionContext = (routine: Routine) => {
  const hasStake = !!(routine.stakeAmount && routine.stakeAmount > 0)
  const streakLength = routine.streak

  return {
    hasStake,
    streakLength,
  }
}

export const generateReliabilityReason = (
  action: string,
  itemName: string,
  context?: { hasStake?: boolean; isOverdue?: boolean; streakLength?: number },
): string => {
  const baseReasons = {
    complete_task: `Completed task: ${itemName}`,
    miss_task: `Missed task: ${itemName}`,
    complete_routine: `Completed routine: ${itemName}`,
    miss_routine: `Missed routine: ${itemName}`,
    break_streak: `Broke streak: ${itemName}`,
  }

  let reason = baseReasons[action as keyof typeof baseReasons] || `Action: ${action}`

  if (context?.hasStake) {
    reason += " (Staked)"
  }

  if (context?.isOverdue) {
    reason += " (Overdue)"
  }

  if (context?.streakLength && context.streakLength > 7) {
    reason += ` (${context.streakLength} day streak)`
  }

  return reason
}
