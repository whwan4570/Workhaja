"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { useAuth } from "@/hooks/useAuth"
import { storesApi } from "@/lib/api"
import { triggerInternalJob } from "@/lib/notificationsApi"
import { toast } from "sonner"
import { AlertCircle, Play, Key } from "lucide-react"

export default function NotificationsDebugPage() {
  const router = useRouter()
  const { storeId, isLoading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<"OWNER" | "MANAGER" | "WORKER" | null>(null)
  const [internalKey, setInternalKey] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)
  const [debugEnabled, setDebugEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if no storeId
  useEffect(() => {
    if (!authLoading && !storeId) {
      router.replace("/stores")
    }
  }, [storeId, authLoading, router])

  // Load user role and internal key
  useEffect(() => {
    if (storeId && !authLoading) {
      loadUserRole()
      loadInternalKey()
    }
  }, [storeId, authLoading])

  const loadUserRole = async () => {
    if (!storeId) return
    try {
      const membership = await storesApi.getStoreMe(storeId)
      setUserRole(membership.role)
      if (membership.role !== "OWNER" && membership.role !== "MANAGER") {
        router.replace("/notifications")
      }
    } catch (err) {
      console.error("Failed to load user role:", err)
      try {
        const stores = await storesApi.getStores()
        const store = stores.find((s) => s.id === storeId)
        if (store && "myRole" in store) {
          const role = store.myRole as "OWNER" | "MANAGER" | "WORKER"
          setUserRole(role)
          if (role !== "OWNER" && role !== "MANAGER") {
            router.replace("/notifications")
          }
        } else {
          router.replace("/notifications")
        }
      } catch (e) {
        router.replace("/notifications")
      }
    }
  }

  const loadInternalKey = () => {
    if (typeof window !== "undefined") {
      const key = localStorage.getItem("workhaja_internal_key") || ""
      setInternalKey(key)
    }
  }

  const saveInternalKey = (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("workhaja_internal_key", key)
    }
    setInternalKey(key)
  }

  const handleTriggerJob = async (endpoint: string, jobName: string) => {
    if (!internalKey) {
      toast.error("Internal key is required")
      return
    }

    if (!storeId) {
      toast.error("Store ID is required")
      return
    }

    setProcessing(jobName)
    setError(null)

    try {
      await triggerInternalJob(`/stores/${storeId}${endpoint}`, internalKey)
      toast.success(`${jobName} triggered successfully`)
    } catch (err: any) {
      console.error(`Failed to trigger ${jobName}:`, err)
      const errorMessage = err?.message || `Failed to trigger ${jobName}`
      
      if (errorMessage.includes("not enabled") || errorMessage.includes("404")) {
        setDebugEnabled(false)
        setError("Debug endpoints are not enabled on this server")
      } else {
        setError(errorMessage)
      }
      toast.error(errorMessage)
    } finally {
      setProcessing(null)
    }
  }

  if (authLoading || !storeId) {
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

  if (userRole !== "OWNER" && userRole !== "MANAGER") {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-64">
          <Topbar />
          <main className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                This page is only available to Owners and Managers.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Notification Debug Tools</h1>
            <p className="text-muted-foreground mt-2">
              Trigger server-side notification jobs (admin only)
            </p>
          </div>

          {!debugEnabled && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Debug Endpoints Not Available</AlertTitle>
              <AlertDescription>
                Debug endpoints are not enabled on this server. These tools are for development/testing purposes only.
              </AlertDescription>
            </Alert>
          )}

          {error && debugEnabled && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Internal Key Input */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Internal API Key
              </CardTitle>
              <CardDescription>
                Required for triggering internal notification jobs. Stored locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="internal-key">Internal Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="internal-key"
                    type="password"
                    value={internalKey}
                    onChange={(e) => saveInternalKey(e.target.value)}
                    placeholder="Enter internal API key"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This key is stored in localStorage as "workhaja_internal_key"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Job Triggers */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Expiration Job</CardTitle>
                <CardDescription>
                  Check for expiring documents and send notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleTriggerJob("/admin/notifications/run/doc-expiration", "Document Expiration Job")}
                  disabled={!internalKey || processing !== null}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {processing === "Document Expiration Job" ? "Processing..." : "Trigger Job"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability Deadline Job</CardTitle>
                <CardDescription>
                  Check for upcoming availability deadlines and send reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleTriggerJob("/admin/notifications/run/availability-deadline", "Availability Deadline Job")}
                  disabled={!internalKey || processing !== null}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {processing === "Availability Deadline Job" ? "Processing..." : "Trigger Job"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Process Pending Notifications</CardTitle>
                <CardDescription>
                  Process all pending notifications in the outbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleTriggerJob("/admin/notifications/run/process", "Process Pending")}
                  disabled={!internalKey || processing !== null}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {processing === "Process Pending" ? "Processing..." : "Trigger Job"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

