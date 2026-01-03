"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { useAuth } from "@/hooks/useAuth"
import { getStoreId } from "@/lib/api"
import { createTimeEntry, listTimeEntries, getCurrentPosition, type TimeEntryType, type TimeEntry } from "@/lib/timeEntriesApi"
import { Clock, MapPin, AlertCircle, CheckCircle2, XCircle, ArrowLeft, QrCode } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

export default function CheckInPage() {
  const router = useRouter()
  const { storeId, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastEntry, setLastEntry] = useState<TimeEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([])

  // Redirect if no storeId
  useEffect(() => {
    if (!authLoading && !storeId) {
      router.replace("/stores")
    }
  }, [storeId, authLoading, router])

  // Load recent entries
  useEffect(() => {
    if (storeId && !authLoading) {
      loadRecentEntries()
    }
  }, [storeId, authLoading])

  const loadRecentEntries = async () => {
    if (!storeId) return

    try {
      const entries = await listTimeEntries(storeId, {})
      setRecentEntries(entries.slice(0, 10)) // Last 10 entries

      // Find last entry
      const last = entries.find((e) => e.status === "APPROVED")
      if (last) {
        setLastEntry(last)
      }
    } catch (err: any) {
      console.error("Failed to load recent entries:", err)
    }
  }

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

      await loadRecentEntries()

      if (entry.status === "APPROVED") {
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-64">
          <Topbar />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!storeId) {
    return null
  }

  const lastCheckIn = recentEntries.find((e) => e.type === "CHECK_IN" && e.status === "APPROVED")
  const lastCheckOut = recentEntries.find((e) => e.type === "CHECK_OUT" && e.status === "APPROVED")

  // Determine current status: if last approved entry is CHECK_IN and no CHECK_OUT after it, we're checked in
  const isCheckedIn = lastCheckIn && (!lastCheckOut || new Date(lastCheckIn.timestamp) > new Date(lastCheckOut.timestamp))
  const isCheckedOut = !isCheckedIn

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/schedule" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Schedule
            </Link>
            <h1 className="text-3xl font-bold">Check In / Check Out</h1>
            <p className="text-muted-foreground mt-1">Record your work time with location verification</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={isCheckedIn ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {isCheckedIn ? "Checked In" : "Checked Out"}
                  </Badge>
                </div>
                {lastCheckIn && (
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">Last Check In</div>
                    <div className="font-medium">
                      {format(new Date(lastCheckIn.timestamp), "MMM d, h:mm a")}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4">
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
                <Link href="/qrscan" className="block">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Location verification: {typeof navigator !== "undefined" && navigator.geolocation ? "Available" : "Not available"}
              </div>
            </CardContent>
          </Card>

          {recentEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your last 10 time entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={entry.type === "CHECK_IN" ? "default" : "secondary"}>
                          {entry.type === "CHECK_IN" ? "In" : "Out"}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                          </div>
                          {entry.locationVerified && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.status === "APPROVED" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Approved
                          </Badge>
                        ) : entry.status === "PENDING_REVIEW" ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

