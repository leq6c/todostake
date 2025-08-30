export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  list: string
  stakeAmount?: number
  stakeCurrency?: string // Added stakeCurrency property for currency selection
  dueDate?: Date | null
  starred?: boolean // Added starred property for star functionality
  memo?: string
  proverInstructions?: string
  todayAddedOn?: string // ISO date string when user adds it to "Today" (separate from dueDate)
}

export interface TodoList {
  id: string
  name: string
  color: string
}

export interface Routine {
  id: string
  name: string
  type: "daily" | "weekly" | "monthly"
  createdAt?: Date
  description?: string
  streak: number
  maxStreak: number
  completedDates: string[]
  stakeAmount?: number
  stakeCurrency?: string // Added stakeCurrency property for currency selection
  maxAbsence?: number
  stopped?: boolean
  paused?: boolean
  proverInstructions?: string
}

export interface ChatMessage {
  role: "user" | "ai"
  message: string
  timestamp?: Date
}

export interface ModalPosition {
  x: number
  y: number
}

export type ArrowPosition = "left-top" | "left-center" | "right-top" | "right-center" | "right-bottom"

export type ModalType = "account" | "chat" | "proof" | "reason"

export interface ModalData {
  type: ModalType
  position: ModalPosition
  arrowPosition: ArrowPosition
  data?: any
  onSubmit?: (data: any) => void
}

export interface TodoCounts {
  today: number
  planned: number
  tasks: number
}

export interface StreakData {
  date: string
  completed: boolean
}

export interface UserProfile {
  name: string
  email: string
  reliabilityScore: number
  reliabilityHistory: ReliabilityEntry[]
  walletAddress?: string
  walletConnected: boolean
}

export interface ReliabilityEntry {
  date: string
  score: number
  change: number
  reason: string
}
