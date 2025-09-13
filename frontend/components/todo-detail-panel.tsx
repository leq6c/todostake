"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SpeechBubbleModal } from "@/components/ui/speech-bubble-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MessageSquare, Upload, Send, Star, X } from "lucide-react"
import { DetailPanelLayout } from "@/components/ui/detail-panel-layout"
import { ActionButton } from "@/components/ui/action-button"
import { CircularCheckbox } from "@/components/ui/circular-checkbox"
import { StakeSection } from "@/components/ui/stake-section"
import type { Todo } from "@/types"
import { toast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"

interface TodoDetailPanelProps {
  todo: Todo | null
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function TodoDetailPanel({ todo, onClose, onUpdate, onDelete, onToggle }: TodoDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo?.text || "")
  const [memo, setMemo] = useState(todo?.memo || "")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [stakeAmount, setStakeAmount] = useState("")
  const [showProverModal, setShowProverModal] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; message: string }>>([])
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [proverInstructions, setProverInstructions] = useState(todo?.proverInstructions || "")
  const [isStarred, setIsStarred] = useState(todo?.starred || false)
  const [isAddedToToday, setIsAddedToToday] = useState(() => {
    const added = todo?.todayAddedOn
    if (!added) return false
    const t = new Date()
    const todayStr = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toISOString().split("T")[0]
    return added === todayStr
  })
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(todo?.dueDate || null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteModalPosition, setDeleteModalPosition] = useState({ x: 0, y: 0 })
  const {profile} = useProfile()

  // Keep local UI state in sync when a new todo is selected or data updates
  React.useEffect(() => {
    setEditText(todo?.text || "")
    setMemo(todo?.memo || "")
    setProverInstructions(todo?.proverInstructions || "")
    setIsStarred(!!todo?.starred)
    const d = todo?.dueDate || null
    setSelectedDueDate(d)
    const added = todo?.todayAddedOn
    if (added) {
      const t = new Date()
      const todayStr = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toISOString().split("T")[0]
      setIsAddedToToday(added === todayStr)
    } else {
      setIsAddedToToday(false)
    }
  }, [todo?.id, todo?.text, todo?.memo, todo?.proverInstructions, todo?.starred, todo?.dueDate, todo?.todayAddedOn])

  if (!todo) {
    return (
      <DetailPanelLayout onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No item selected</p>
        </div>
      </DetailPanelLayout>
    )
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() })
      setIsEditing(false)
      toast({ title: "Task updated" })
    }
  }

  const handleAddToToday = () => {
    const now = new Date()
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split("T")[0]
    if (isAddedToToday) {
      onUpdate(todo.id, { todayAddedOn: null as any })
      setIsAddedToToday(false)
    } else {
      onUpdate(todo.id, { todayAddedOn: todayStr } as any)
      setIsAddedToToday(true)
    }
  }

  const handleAddDueDate = () => {
    setShowDatePicker(true)
  }

  const handleDateSelect = (date: Date) => {
    onUpdate(todo.id, { dueDate: date })
    setSelectedDueDate(date)
    setShowDatePicker(false)
    toast({ title: "Due date set", description: date.toLocaleDateString() })
  }

  const handleRemoveDueDate = () => {
    onUpdate(todo.id, { dueDate: null })
    setSelectedDueDate(null)
    toast({ title: "Due date removed" })
  }

  const handleToggleStar = () => {
    const newStarred = !isStarred
    onUpdate(todo.id, { starred: newStarred })
    setIsStarred(newStarred)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = date.toDateString() === today.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`h-8 w-8 text-sm rounded-full hover:bg-muted transition-colors ${
            isToday ? "bg-foreground text-background" : "text-foreground"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    setChatHistory((prev) => [...prev, { role: "user", message: chatMessage }])

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          message:
            "I'll help you create specific conditions to prevent cheating. What aspects of this task would you like to make more verifiable?",
        },
      ])

      setTimeout(() => {
        const instructions =
          "Take a photo of the completed task with timestamp. Must include clear view of the work area and any relevant documentation or evidence of completion."
        setProverInstructions(instructions)
        onUpdate(todo.id, { proverInstructions: instructions })
        setShowProverModal(false)
        toast({ title: "Instructions updated" })
      }, 1500)
    }, 1000)

    setChatMessage("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          message: `Uploaded: ${file.name} (${file.type})`,
        },
      ])
    }
  }

  const handleShowProverModal = () => {
    setButtonPosition({ x: 0, y: 0 })
    setShowProverModal(true)
  }

  const handleStakeSubmit = (amount: number, currency: string) => {
    onUpdate(todo.id, { stakeAmount: amount, stakeCurrency: currency })
    toast({ title: "Stake updated", description: `${amount} ${currency}` })
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    onDelete(todo.id)
    onClose()
  }

  return (
    <DetailPanelLayout
      onClose={onClose}
      onDelete={() => handleDeleteClick()}
      footerContent={`Created ${todo.createdAt.toLocaleDateString()}`}
    >
      <div className="flex items-center gap-3">
        <CircularCheckbox checked={todo.completed} onClick={() => onToggle(todo.id)} />
        <button
          className={`transition-colors ${isStarred ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`}
          onClick={handleToggleStar}
        >
          <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Title Edit */}
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit()
                if (e.key === "Escape") {
                  setIsEditing(false)
                  setEditText(todo.text)
                }
              }}
              className="text-lg font-medium"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditText(todo.text)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <h3
            className="text-lg font-medium text-foreground cursor-pointer hover:text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            {todo.text}
          </h3>
        )}
      </div>

      <div className="space-y-3">
        {isAddedToToday ? (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border/50">
            <span className="text-sm text-foreground">Added to Today</span>
            <button
              onClick={handleAddToToday}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ActionButton icon={<Calendar className="h-4 w-4" />} onClick={handleAddToToday}>
            Add to Today
          </ActionButton>
        )}

        <div className="space-y-2">
          {selectedDueDate ? (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Due {selectedDueDate.toLocaleDateString()}</span>
              </div>
              <button
                onClick={handleRemoveDueDate}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <ActionButton icon={<Clock className="h-4 w-4" />} onClick={handleAddDueDate}>
              Add due date
            </ActionButton>
          )}

          {showDatePicker && (
            <div className="p-4 border border-border rounded-lg bg-card space-y-3">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
                  {/* ChevronLeft icon here */}
                </Button>
                <h4 className="font-medium">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h4>
                <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
                  {/* ChevronRight icon here */}
                </Button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="h-6 flex items-center justify-center font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

              {/* Cancel Button */}
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowDatePicker(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Memo */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Memo</label>
        <Textarea
          placeholder="Add notes..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={() => {
            if (todo && memo !== (todo.memo || "")) {
              onUpdate(todo.id, { memo })
              toast({ title: "Memo saved" })
            }
          }}
          className="min-h-[100px] resize-none focus-visible:ring-2 focus-visible:ring-ring/30 border border-input bg-background rounded-md"
        />
      </div>

      {/* Stake Section */}
      {profile?.walletConnected && (
        <StakeSection
          currentStakeAmount={todo.stakeAmount}
          currentCurrency={todo.stakeCurrency}
          onStakeSubmit={handleStakeSubmit}
          onAddInstructions={handleShowProverModal}
          proverInstructions={proverInstructions}
        />
      )}

      <SpeechBubbleModal
        isOpen={showProverModal}
        onClose={() => setShowProverModal(false)}
        position={buttonPosition}
        title="Prover Instructions"
        width="w-96"
        height="h-80"
        arrowPosition="right-bottom"
      >
        {/* Chat History */}
        <div className="p-3 space-y-2 flex-1 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p>Define proof conditions</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-2 rounded-lg text-xs ${
                    chat.role === "user"
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-border space-y-2 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <label className="flex-shrink-0">
              <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent" asChild>
                <span>
                  <Upload className="h-3 w-3" />
                </span>
              </Button>
            </label>

            <Textarea
              placeholder="Describe proof conditions..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1 text-xs min-h-[32px] max-h-24 resize-none"
              rows={1}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!chatMessage.trim()}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </SpeechBubbleModal>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this todo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DetailPanelLayout>
  )
}
