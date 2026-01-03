"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getStoreId } from "@/lib/api"
import { createTimeEntry, getCurrentPosition, type TimeEntryType } from "@/lib/timeEntriesApi"
import { Clock, MapPin, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface CheckInCheckOutCardProps {
  storeId?: string | null
  userRole?: "OWNER" | "MANAGER" | "WORKER" | null
}

export function CheckInCheckOutCard({ storeId, userRole }: CheckInCheckOutCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<"CHECKED_IN" | "CHECKED_OUT" | null>(null)
  const [lastEntry, setLastEntry] = useState<{
    type: TimeEntryType
    timestamp: string
    status: string
  } | null>(null)

  const handleCheckInOut = async (type: TimeEntryType) => {
    if (!storeId) {
      setError("Store not selected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get GPS position
      let latitude: number | undefined
      let longitude: number | undefined

      try {
        const position = await getCurrentPosition()
        latitude = position.coords.latitude
        longitude = position.coords.longitude
      } catch (geoError: any) {
        // GPS 권한 거부 또는 오류 - 수동 확인 요청으로 fallback
        console.warn("Failed to get GPS position:", geoError)
        // 위치 없이도 체크인/체크아웃 가능 (PENDING_REVIEW 상태로)
      }

      // Create time entry
      const entry = await createTimeEntry(storeId, {
        type,
        latitude,
        longitude,
        clientTimestamp: new Date().toISOString(),
      })

      setLastEntry({
        type: entry.type,
        timestamp: entry.timestamp,
        status: entry.status,
      })

      if (entry.status === "APPROVED") {
        setCurrentStatus(type === "CHECK_IN" ? "CHECKED_IN" : "CHECKED_OUT")
        toast.success(
          `${type === "CHECK_IN" ? "Checked in" : "Checked out"} at ${format(new Date(entry.timestamp), "h:mm a")}`
        )
      } else {
        toast.info(
          `${type === "CHECK_IN" ? "Check-in" : "Check-out"} submitted. Pending review.`
        )
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to check in/out"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!storeId) {
    return null
  }

  const isCheckedIn = currentStatus === "CHECKED_IN"
  const isCheckedOut = currentStatus === "CHECKED_OUT"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Check In / Check Out
        </CardTitle>
        <CardDescription>
          Record your work time with location verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {lastEntry && (
          <Alert className={lastEntry.status === "APPROVED" ? "bg-green-50 border-green-500" : "bg-yellow-50 border-yellow-500"}>
            {lastEntry.status === "APPROVED" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={lastEntry.status === "APPROVED" ? "text-green-800" : "text-yellow-800"}>
              {lastEntry.type === "CHECK_IN" ? "Checked in" : "Checked out"} at{" "}
              {format(new Date(lastEntry.timestamp), "h:mm a")}
              {lastEntry.status !== "APPROVED" && " (Pending review)"}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => handleCheckInOut("CHECK_IN")}
            disabled={isLoading || isCheckedIn}
            className="flex-1"
            size="lg"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Check In
          </Button>
          <Button
            onClick={() => handleCheckInOut("CHECK_OUT")}
            disabled={isLoading || isCheckedOut || !isCheckedIn}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Check Out
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Location verification: {navigator.geolocation ? "Available" : "Not available"}
        </div>
      </CardContent>
    </Card>
  )
}

