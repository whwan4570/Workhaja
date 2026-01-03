"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { useAuth } from "@/hooks/useAuth"
import { checkinWithTotp } from "@/lib/totpApi"
import { listTimeEntries } from "@/lib/timeEntriesApi"
import { QrCode, AlertCircle, Camera, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Html5Qrcode } from "html5-qrcode"

export default function QRScanPage() {
  const router = useRouter()
  const { storeId, isLoading: authLoading } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerElementId = "qr-reader"

  useEffect(() => {
    if (!authLoading && !storeId) {
      router.replace("/stores")
    }
  }, [storeId, authLoading, router])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current = null
          })
          .catch((err) => {
            console.error("Error stopping QR scanner:", err)
          })
      }
    }
  }, [])

  const startScanning = async () => {
    if (!storeId) return

    try {
      setError(null)
      setScanResult(null)

      // Initialize Html5Qrcode
      const html5QrCode = new Html5Qrcode(scannerElementId)
      html5QrCodeRef.current = html5QrCode

      // Start scanning
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          handleQRCodeScanned(decodedText)
        },
        (errorMessage) => {
          // Scan error (ignore, just continue scanning)
        }
      )

      setIsScanning(true)
    } catch (err: any) {
      console.error("Failed to start QR scanner:", err)
      setError(err?.message || "Failed to start camera. Please check camera permissions.")
      toast.error(err?.message || "Failed to start camera")
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
    setIsScanning(false)
    setScanResult(null)
  }

  const handleQRCodeScanned = async (qrCodeText: string) => {
    if (!storeId || isProcessing) return

    setScanResult(qrCodeText)
    setIsProcessing(true)
    
    // Stop scanning
    await stopScanning()

    try {
      // Parse QR code URL format: workhaja://checkin/{storeId}/{token}
      const urlMatch = qrCodeText.match(/workhaja:\/\/checkin\/([^/]+)\/([^/]+)/)
      if (!urlMatch) {
        throw new Error("Invalid QR code format")
      }

      const [, scannedStoreId, token] = urlMatch

      // Verify store ID matches
      if (scannedStoreId !== storeId) {
        throw new Error("QR code is for a different store")
      }

      // Determine check-in type based on last entry
      let type: "CHECK_IN" | "CHECK_OUT" = "CHECK_IN"
      try {
        const entries = await listTimeEntries(storeId, {})
        const lastApprovedEntry = entries.find((e) => e.status === "APPROVED")
        if (lastApprovedEntry && lastApprovedEntry.type === "CHECK_IN") {
          type = "CHECK_OUT"
        }
      } catch (err) {
        console.warn("Failed to check last entry, defaulting to CHECK_IN:", err)
        // Default to CHECK_IN if we can't determine
      }

      // Call API to check in/out
      await checkinWithTotp(storeId, token, type)
      
      toast.success(`${type === "CHECK_IN" ? "Check-in" : "Check-out"} successful!`)
      
      // Redirect to check-in page after a delay
      setTimeout(() => {
        router.push("/checkin")
      }, 1500)
    } catch (err: any) {
      console.error("Failed to process QR code:", err)
      const errorMessage = err?.message || "Failed to check in. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setScanResult(null)
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Scan QR Code</h1>
            <p className="text-muted-foreground mt-2">
              Scan the QR code displayed by your manager to check in or out
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
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>
                Position the QR code within the frame to scan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning && !isProcessing && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Click the button below to start scanning
                  </p>
                  <Button onClick={startScanning} size="lg">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                </div>
              )}

              {isScanning && (
                <>
                  <div id={scannerElementId} className="w-full" />
                  <div className="flex justify-center">
                    <Button onClick={stopScanning} variant="outline">
                      Stop Scanning
                    </Button>
                  </div>
                </>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Processing QR code...</p>
                </div>
              )}

              {scanResult && !isProcessing && (
                <Alert>
                  <AlertDescription>Scanned: {scanResult}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

