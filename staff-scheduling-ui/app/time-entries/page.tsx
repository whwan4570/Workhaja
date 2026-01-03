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
import {
  getPendingTimeEntries,
  reviewTimeEntry,
  listTimeEntries,
  type TimeEntry,
  type ReviewTimeEntryDto,
} from "@/lib/timeEntriesApi"
import { AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function TimeEntriesPage() {
  const router = useRouter()
  const { storeId, isLoading: authLoading } = useAuth()
  const [pendingEntries, setPendingEntries] = useState<TimeEntry[]>([])
  const [allEntries, setAllEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [reviewNote, setReviewNote] = useState("")
  const [reviewing, setReviewing] = useState(false)

  // Redirect if no storeId
  useEffect(() => {
    if (!authLoading && !storeId) {
      router.replace("/stores")
    }
  }, [storeId, authLoading, router])

  // Load data
  useEffect(() => {
    if (storeId && !authLoading) {
      loadData()
    }
  }, [storeId, authLoading])

  const loadData = async () => {
    if (!storeId) return

    try {
      setLoading(true)
      setError(null)

      const [pending, all] = await Promise.all([
        getPendingTimeEntries(storeId),
        listTimeEntries(storeId, {}),
      ])

      setPendingEntries(pending)
      setAllEntries(all)
    } catch (err: any) {
      setError(err?.message || "Failed to load time entries")
      toast.error("Failed to load time entries")
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setReviewStatus("APPROVED")
    setReviewNote("")
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!storeId || !selectedEntry) return

    try {
      setReviewing(true)

      const reviewDto: ReviewTimeEntryDto = {
        status: reviewStatus,
        reviewNote: reviewNote || undefined,
      }

      await reviewTimeEntry(storeId, selectedEntry.id, reviewDto)

      toast.success(`Time entry ${reviewStatus.toLowerCase()}`)
      setReviewDialogOpen(false)
      setSelectedEntry(null)
      await loadData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to review time entry")
    } finally {
      setReviewing(false)
    }
  }

  if (authLoading || loading) {
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-6 max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Time Entries Review</h1>
              <p className="text-muted-foreground mt-1">Review and approve/reject employee check-ins and check-outs</p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pending Entries */}
          {pendingEntries.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pending Review ({pendingEntries.length})
                </CardTitle>
                <CardDescription>Time entries requiring your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Badge variant={entry.type === "CHECK_IN" ? "default" : "secondary"}>
                          {entry.type === "CHECK_IN" ? "Check In" : "Check Out"}
                        </Badge>
                        <div>
                          <div className="font-medium">{entry.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                          </div>
                          {entry.locationVerified ? (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Location verified ({entry.distanceMiles?.toFixed(2)} miles)
                            </div>
                          ) : (
                            <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              Location not verified
                            </div>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => handleReview(entry)} size="sm">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Entries */}
          <Card>
            <CardHeader>
              <CardTitle>All Time Entries</CardTitle>
              <CardDescription>Complete history of check-ins and check-outs</CardDescription>
            </CardHeader>
            <CardContent>
              {allEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No time entries found
                </div>
              ) : (
                <div className="space-y-2">
                  {allEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant={entry.type === "CHECK_IN" ? "default" : "secondary"}>
                          {entry.type === "CHECK_IN" ? "In" : "Out"}
                        </Badge>
                        <div>
                          <div className="font-medium">{entry.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                          </div>
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
                        {entry.reviewNote && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {entry.reviewNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Dialog */}
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Time Entry</DialogTitle>
                <DialogDescription>
                  {selectedEntry?.user.name} - {selectedEntry?.type === "CHECK_IN" ? "Check In" : "Check Out"} at{" "}
                  {selectedEntry && format(new Date(selectedEntry.timestamp), "h:mm a")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={reviewStatus === "APPROVED" ? "default" : "outline"}
                      onClick={() => setReviewStatus("APPROVED")}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant={reviewStatus === "REJECTED" ? "destructive" : "outline"}
                      onClick={() => setReviewStatus("REJECTED")}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reviewNote">Note (Optional)</Label>
                  <Textarea
                    id="reviewNote"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add a note about this review..."
                    className="mt-2"
                  />
                </div>
                {selectedEntry && (
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      {selectedEntry.locationVerified ? (
                        <span className="text-green-600">Verified ({selectedEntry.distanceMiles?.toFixed(2)} miles)</span>
                      ) : (
                        <span className="text-yellow-600">Not verified</span>
                      )}
                    </div>
                    {selectedEntry.shift && (
                      <div>
                        <span className="text-muted-foreground">Shift:</span>{" "}
                        {format(new Date(selectedEntry.shift.date), "MMM d")} {selectedEntry.shift.startTime} - {selectedEntry.shift.endTime}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview} disabled={reviewing}>
                  {reviewing ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}

