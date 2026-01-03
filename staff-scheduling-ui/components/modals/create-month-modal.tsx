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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatYMD, addMonths } from "@/lib/date"

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
  year: initialYear,
  month: initialMonth,
  onSuccess,
}: CreateMonthModalProps) {
  // Get next month as default
  const getDefaultMonth = () => {
    const nextMonth = addMonths(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    return nextMonth
  }
  const defaultMonth = getDefaultMonth()
  
  const [selectedYear, setSelectedYear] = useState(defaultMonth.year)
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.month)
  const [lockAt, setLockAt] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const nextMonth = getDefaultMonth()
      setSelectedYear(nextMonth.year)
      setSelectedMonth(nextMonth.month)
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
        year: selectedYear,
        month: selectedMonth,
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
              Select a month and year to create a new schedule.
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
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value, 10))}
                disabled={isLoading}
              >
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value, 10))}
                disabled={isLoading}
              >
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

