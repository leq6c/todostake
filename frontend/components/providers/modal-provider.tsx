"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { GenericBubbleModal } from "../ui/generic-bubble-modal"
import { X } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { AccountModal } from "../account-modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Send, MessageSquare } from "lucide-react"

interface ModalPosition {
  x: number
  y: number
}

interface ModalConfig {
  type: "account" | "chat" | "reason" | "proof" | "confirmation"
  position: ModalPosition
  arrowPosition: "left-top" | "right-top" | "right-bottom" | "left-center"
  data?: any
  onClose?: () => void
  onSubmit?: (data: any) => void
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void
  hideModal: () => void
  isModalOpen: boolean
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}

interface ModalProviderProps {
  children: ReactNode
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const { profile } = useProfile()
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; message: string }>>([])
  const [launchTime, setLaunchTime] = useState<number | null>(new Date().getTime())

  const showModal = (config: ModalConfig) => {
    setLaunchTime(new Date().getTime())
    setModalConfig(config)
    if (config.type === "proof") {
      setChatHistory([{ role: "ai", message: "Prove it!" }])
      setChatMessage("")
    }
  }

  const hideModal = () => {
    if (launchTime && new Date().getTime() - launchTime < 500) {
      return;
    }
    setModalConfig(null)
    setChatHistory([])
    setChatMessage("")
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    setChatHistory((prev) => [...prev, { role: "user", message: chatMessage }])

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          message: "Great! Your proof has been submitted. The task will be marked as complete.",
        },
      ])

      setTimeout(() => {
        modalConfig?.onSubmit?.(modalConfig.data)
        hideModal()
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

  const renderModalContent = () => {
    if (!modalConfig) return null

    switch (modalConfig.type) {
      case "account":
        return <AccountModal />

      case "chat":
      case "proof":
        return (
          <div className="flex flex-col h-80 min-h-80">
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-4">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p>Prove your task completion</p>
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
                  placeholder="Describe how you completed this task..."
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
          </div>
        )

      case "reason":
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-medium">Why are you {modalConfig.data?.action}ing this routine?</h3>
            <textarea
              className="w-full text-sm border rounded px-2 py-1 resize-none"
              rows={3}
              placeholder="Enter your reason..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={hideModal} className="px-3 py-1 border rounded text-sm">
                Cancel
              </button>
              <button
                onClick={() => {
                  modalConfig.onSubmit?.(modalConfig.data?.action)
                  hideModal()
                }}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        )

      case "confirmation":
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-medium">{modalConfig.data?.title || "Confirm Action"}</h3>
            <p className="text-sm text-muted-foreground">
              {modalConfig.data?.description || "Are you sure you want to proceed?"}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={hideModal}>
                {modalConfig.data?.cancelText || "Cancel"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  modalConfig.data?.onConfirm?.()
                  hideModal()
                }}
              >
                {modalConfig.data?.confirmText || "Confirm"}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <ModalContext.Provider value={{ showModal, hideModal, isModalOpen: !!modalConfig }}>
      {children}
      {modalConfig && (
        // If floatingWindowMode is unset or true, use floating bubble modal; otherwise use full-screen overlay
        (profile?.floatingWindowMode ?? true) ? (
          <GenericBubbleModal
            isOpen={true}
            onClose={hideModal}
            position={modalConfig.position}
            arrowPosition={modalConfig.arrowPosition}
            width="w-96"
            height="h-auto"
          >
            {renderModalContent()}
          </GenericBubbleModal>
        ) : (
          <>
            <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={hideModal} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-end p-2 border-b border-border">
                  <Button variant="ghost" size="sm" onClick={hideModal} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">{renderModalContent()}</div>
              </div>
            </div>
          </>
        )
      )}
    </ModalContext.Provider>
  )
}
