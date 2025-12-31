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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatYMD } from "@/lib/date"

interface CreateMonthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  year: number
  month: number
  onSuccess?: () => void
}

export function CreateMonthModal({
  open,
  onOpenChange,
  storeId,
  year,
  month,
  onSuccess,
}: CreateMonthModalProps) {
  const [lockAt, setLockAt] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setLockAt("")
      setError("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    setIsLoading(true)
    try {
      const { createMonth } = await import("@/lib/schedulingApi")
      
      // Convert lockAt to ISO string if provided
      const lockAtISO = lockAt
        ? new Date(lockAt).toISOString()
        : undefined

      await createMonth(storeId, {
        year,
        month,
        lockAt: lockAtISO,
      })

      // Reset form
      setLockAt("")
      setError("")

      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create month"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError("")
      onOpenChange(false)
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Schedule Month</DialogTitle>
            <DialogDescription>
              Create a new schedule month for {monthNames[month - 1]} {year}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={year} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="number" value={month} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockAt">Availability Deadline (Optional)</Label>
              <Input
                id="lockAt"
                type="datetime-local"
                value={lockAt}
                onChange={(e) => setLockAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set a deadline for employees to submit availability requests.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Month"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

