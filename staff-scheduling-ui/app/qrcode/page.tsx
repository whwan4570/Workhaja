"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { useAuth } from "@/hooks/useAuth"
import { getQRCode, resetTotpSecret } from "@/lib/totpApi"
import { storesApi } from "@/lib/api"
import { RefreshCw, QrCode, AlertCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function QRCodePage() {
  const router = useRouter()
  const { storeId, isLoading: authLoading } = useAuth()
  const [userRole, setUserRole] = useState<"OWNER" | "MANAGER" | "WORKER" | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [token, setToken] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isManagerOrOwner = userRole === "OWNER" || userRole === "MANAGER"

  // Load user role
  useEffect(() => {
    if (storeId && !authLoading) {
      loadUserRole()
    }
  }, [storeId, authLoading])

  const loadUserRole = async () => {
    if (!storeId) return
    try {
      const stores = await storesApi.getStores()
      const store = stores.find((s) => s.id === storeId)
      if (store && store.role) {
        setUserRole(store.role as "OWNER" | "MANAGER" | "WORKER")
      } else {
        setUserRole("WORKER")
      }
    } catch (err) {
      console.error("Failed to load user role:", err)
      setUserRole("WORKER")
    }
  }

  useEffect(() => {
    if (!authLoading && !storeId) {
      router.replace("/stores")
      return
    }
    if (!authLoading && !isManagerOrOwner) {
      router.replace("/checkin")
      return
    }
    if (!authLoading && storeId && isManagerOrOwner) {
      loadQRCode()
    }
  }, [storeId, userRole, authLoading, router, isManagerOrOwner])

  // Auto-refresh QR code every 25 seconds (before 30s expiry)
  useEffect(() => {
    if (expiresAt && timeRemaining > 0) {
      refreshIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
        setTimeRemaining(remaining)
        
        // Refresh QR code when less than 10 seconds remaining
        if (remaining <= 10 && remaining > 0) {
          loadQRCode()
        }
      }, 1000)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [expiresAt, timeRemaining])

  const loadQRCode = async () => {
    if (!storeId) return

    setIsLoading(true)
    setError(null)
    try {
      const result = await getQRCode(storeId)
      setQrCodeDataUrl(result.qrCodeDataUrl)
      setToken(result.token)
      const expiry = new Date(result.expiresAt)
      setExpiresAt(expiry)
      setTimeRemaining(Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000)))
    } catch (err: any) {
      console.error("Failed to load QR code:", err)
      setError(err?.message || "Failed to load QR code.")
      toast.error(err?.message || "Failed to load QR code.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (!storeId || userRole !== "OWNER") return

    if (!confirm("Are you sure you want to reset the TOTP secret? All existing QR codes will become invalid.")) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await resetTotpSecret(storeId)
      toast.success("TOTP secret has been reset. Loading new QR code...")
      await loadQRCode()
    } catch (err: any) {
      console.error("Failed to reset TOTP secret:", err)
      setError(err?.message || "Failed to reset TOTP secret.")
      toast.error(err?.message || "Failed to reset TOTP secret.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || !storeId || (userRole && !isManagerOrOwner)) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-64">
          <Topbar />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {authLoading || !userRole ? "Loading..." : "Access Denied: Only Managers/Owners can view this page."}
              </p>
            </div>
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
            <h1 className="text-3xl font-bold">QR Code for Check-In/Out</h1>
            <p className="text-muted-foreground mt-2">
              Display this QR code for employees to scan and check in/out
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Check-In/Out QR Code</CardTitle>
              <CardDescription>
                This QR code refreshes automatically every 30 seconds. Employees can scan it to check in or out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && !qrCodeDataUrl ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : qrCodeDataUrl ? (
                <>
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg border-2 border-border">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    {timeRemaining > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Expires in {timeRemaining} seconds
                      </p>
                    )}
                    {expiresAt && timeRemaining <= 0 && (
                      <p className="text-sm text-orange-600">
                        Expired - Refreshing...
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Current Token: {token}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={loadQRCode}
                      disabled={isLoading}
                      variant="outline"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh QR Code
                    </Button>
                    {userRole === "OWNER" && (
                      <Button
                        onClick={handleReset}
                        disabled={isLoading}
                        variant="outline"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Secret
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No QR code available</p>
                  <Button onClick={loadQRCode} className="mt-4" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Load QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

