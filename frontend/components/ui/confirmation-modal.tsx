"use client"

import { Button } from "@/components/ui/button"
import { GenericBubbleModal } from "@/components/ui/generic-bubble-modal"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  position: { x: number; y: number }
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  position,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
}: ConfirmationModalProps) {
  return (
    <GenericBubbleModal
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      arrowPosition="right-top"
      width="w-80"
      height="auto"
    >
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            size="sm"
            variant={variant}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </GenericBubbleModal>
  )
}
