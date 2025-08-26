"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Send } from "lucide-react"
import { GenericBubbleModal } from "./generic-bubble-modal"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface SpeechBubbleModalProps {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  title: string
  width?: string
  height?: string
  arrowPosition?: "right-top" | "right-bottom" | "left-top" | "left-bottom" | "left-center"
  initialMessages?: Message[]
  onComplete?: () => void
}

export function SpeechBubbleModal({
  isOpen,
  onClose,
  position,
  title,
  width = "w-96",
  height = "h-80",
  arrowPosition = "right-bottom",
  initialMessages = [],
  onComplete,
}: SpeechBubbleModalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputText, setInputText] = useState("")

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Great! I can see you've provided evidence. Task marked as complete!",
      sender: "assistant",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage, assistantMessage])
    setInputText("")

    setTimeout(() => {
      onComplete?.()
    }, 1000)
  }

  return (
    <GenericBubbleModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      title={title}
      width={width}
      height={height}
      arrowPosition={arrowPosition}
    >
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-2 rounded-lg text-xs ${
                message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2 items-end">
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Upload className="h-4 w-4" />
          </Button>
          <textarea
            placeholder="Describe how you completed the task..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1 resize-none border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px] max-h-[100px]"
            rows={2}
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!inputText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </GenericBubbleModal>
  )
}
