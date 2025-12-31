"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createRequest } from "@/lib/requestsApi"
import { compareTimes } from "@/lib/date"

interface RequestChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  shiftId: string
  currentStartTime: string
  currentEndTime: string
  currentBreakMins: number
  onSuccess: () => void
}

export function RequestChangeModal({
  open,
  onOpenChange,
  storeId,
  shiftId,
  currentStartTime,
  currentEndTime,
  currentBreakMins,
  onSuccess,
}: RequestChangeModalProps) {
  const [proposedStartTime, setProposedStartTime] = useState(currentStartTime)
  const [proposedEndTime, setProposedEndTime] = useState(currentEndTime)
  const [proposedBreakMins, setProposedBreakMins] = useState(String(currentBreakMins))
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setProposedStartTime(currentStartTime)
      setProposedEndTime(currentEndTime)
      setProposedBreakMins(String(currentBreakMins))
      setReason("")
      setError("")
      setIsLoading(false)
    }
  }, [open, currentStartTime, currentEndTime, currentBreakMins])

  const validateForm = () => {
    if (!proposedStartTime || !proposedEndTime) {
      setError("Start time and end time are required")
      return false
    }

    // Validate time format
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    if (!timePattern.test(proposedStartTime) || !timePattern.test(proposedEndTime)) {
      setError("Time must be in HH:mm format")
      return false
    }

    // Validate endTime > startTime
    if (compareTimes(proposedEndTime, proposedStartTime) <= 0) {
      setError("End time must be after start time")
      return false
    }

    if (Number.parseInt(proposedBreakMins) < 0) {
      setError("Break minutes cannot be negative")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await createRequest(storeId, {
        type: "SHIFT_TIME_CHANGE",
        shiftId,
        proposedStartTime,
        proposedEndTime,
        proposedBreakMins: Number.parseInt(proposedBreakMins),
        reason: reason || undefined,
      })
      toast.success("Change request submitted successfully")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to create change request:", err)
      const errorMessage = err?.message || "Failed to submit change request"
      if (errorMessage.includes("409") || errorMessage.includes("already")) {
        setError("There is already a pending request for this shift.")
      } else if (errorMessage.includes("403")) {
        setError("You don't have permission to create change requests for this shift.")
      } else {
        setError(errorMessage)
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Time Change</DialogTitle>
            <DialogDescription>
              Submit a request to change the time for this shift. A manager will review your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label>Current Time</Label>
              <p className="text-sm text-muted-foreground">
                {currentStartTime} - {currentEndTime} ({currentBreakMins} min break)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposedStartTime">Proposed Start Time</Label>
                <Input
                  id="proposedStartTime"
                  type="time"
                  value={proposedStartTime}
                  onChange={(e) => {
                    setProposedStartTime(e.target.value)
                    setError("")
                  }}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposedEndTime">Proposed End Time</Label>
                <Input
                  id="proposedEndTime"
                  type="time"
                  value={proposedEndTime}
                  onChange={(e) => {
                    setProposedEndTime(e.target.value)
                    setError("")
                  }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedBreakMins">Break Minutes</Label>
              <Input
                id="proposedBreakMins"
                type="number"
                min="0"
                step="15"
                value={proposedBreakMins}
                onChange={(e) => {
                  setProposedBreakMins(e.target.value)
                  setError("")
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you need this change..."
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

