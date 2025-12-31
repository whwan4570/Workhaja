"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface PublishConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
}

export function PublishConfirmationModal({ open, onOpenChange, onConfirm }: PublishConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Publish Schedule
          </DialogTitle>
          <DialogDescription className="pt-2">
            Publishing locks the schedule. Changes after publishing will require approval. Are you sure you want to
            continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Publish Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
