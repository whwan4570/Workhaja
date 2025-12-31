"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trash2 } from "lucide-react"
import { formatYMD, compareTimes } from "@/lib/date"
import { upsertAvailability, deleteAvailability, type Availability } from "@/lib/availabilityApi"
import { toast } from "sonner"

interface AvailabilityEditorProps {
  storeId: string
  year: number
  month: number
  selectedDate: Date | null
  currentAvailability: Availability | null
  lockAt: string | null
  monthStatus: "OPEN" | "DRAFT" | "PUBLISHED" | "unknown"
  onSuccess: () => void
  userId?: string // For filtering own availability
}

export function AvailabilityEditor({
  storeId,
  year,
  month,
  selectedDate,
  currentAvailability,
  lockAt,
  monthStatus,
  onSuccess,
  userId,
}: AvailabilityEditorProps) {
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [isAllDay, setIsAllDay] = useState(true)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if deadline has passed
  const isDeadlinePassed = lockAt ? new Date() > new Date(lockAt) : false

  // Initialize form from current availability
  useEffect(() => {
    if (currentAvailability) {
      setIsUnavailable(true)
      setIsAllDay(!currentAvailability.startTime && !currentAvailability.endTime)
      setStartTime(currentAvailability.startTime || "")
      setEndTime(currentAvailability.endTime || "")
    } else {
      setIsUnavailable(false)
      setIsAllDay(true)
      setStartTime("")
      setEndTime("")
    }
    setError(null)
  }, [currentAvailability])

  const handleSave = async () => {
    if (!selectedDate) {
      setError("Please select a date")
      return
    }

    if (!isUnavailable) {
      // If toggled off, delete if exists
      if (currentAvailability?.id) {
        await handleDelete()
      }
      return
    }

    // Validation
    if (!isAllDay) {
      if (!startTime || !endTime) {
        setError("Please enter both start and end times")
        return
      }

      // Validate time format
      const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
      if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
        setError("Time must be in HH:mm format")
        return
      }

      // Validate endTime > startTime
      if (compareTimes(endTime, startTime) <= 0) {
        setError("End time must be after start time")
        return
      }
    }

    setIsSaving(true)
    setError(null)

    try {
      await upsertAvailability(storeId, year, month, {
        date: formatYMD(selectedDate),
        startTime: isAllDay ? null : startTime,
        endTime: isAllDay ? null : endTime,
      })

      toast.success("Availability saved successfully")
      onSuccess()
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to save availability"
      if (errorMessage.includes("403") || errorMessage.includes("locked")) {
        setError("Submission is locked. Contact a manager.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentAvailability?.id) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await deleteAvailability(storeId, currentAvailability.id)
      toast.success("Availability deleted successfully")
      setIsUnavailable(false)
      setIsAllDay(true)
      setStartTime("")
      setEndTime("")
      onSuccess()
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete availability"
      if (errorMessage.includes("403") || errorMessage.includes("locked")) {
        setError("Submission is locked. Contact a manager.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const isDisabled = isDeadlinePassed || monthStatus === "PUBLISHED"

  if (!selectedDate) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">Select a date to manage availability</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isDeadlinePassed && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Availability submission deadline has passed.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isUnavailable"
            checked={isUnavailable}
            onCheckedChange={(checked) => {
              setIsUnavailable(checked === true)
              if (!checked && currentAvailability?.id) {
                // If toggling off, delete
                handleDelete()
              }
            }}
            disabled={isDisabled}
          />
          <Label htmlFor="isUnavailable" className="cursor-pointer">
            I'm unavailable this day
          </Label>
        </div>

        {isUnavailable && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAllDay"
                checked={isAllDay}
                onCheckedChange={(checked) => {
                  setIsAllDay(checked === true)
                  if (checked) {
                    setStartTime("")
                    setEndTime("")
                  }
                }}
                disabled={isDisabled}
              />
              <Label htmlFor="isAllDay" className="cursor-pointer">
                All day
              </Label>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isDisabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isDisabled}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isDisabled || isSaving || isDeleting}
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              {currentAvailability?.id && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDisabled || isSaving || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


