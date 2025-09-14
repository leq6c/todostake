export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  completedAt?: number | null
  list: string
  stakeAmount?: number
  stakeCurrency?: string // Added stakeCurrency property for currency selection
  dueDate?: number | null
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
  createdAt?: number
  description?: string
  memo?: string
  streak: number
  maxStreak: number
  completedDates: string[]
  stakeAmount?: number
  stakeCurrency?: string // Added stakeCurrency property for currency selection
  maxAbsence?: number
  endDate?: number | null
  stopped?: boolean
  paused?: boolean
  proverInstructions?: string
  starred?: boolean
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
  // UI preference: when true, use floating bubble modals; when false, use full-screen modals
  floatingWindowMode?: boolean
}

export interface ReliabilityEntry {
  date: string
  score: number
  change: number
  reason: string
}
