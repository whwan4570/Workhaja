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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { submitMy } from "@/lib/submissionsApi"
import { UploadButton } from "@/components/uploads/upload-button"

interface SubmitComplianceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onSuccess: () => void
}

export function SubmitComplianceModal({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: SubmitComplianceModalProps) {
  const [type, setType] = useState<"HEALTH_CERT" | "HYGIENE_TRAINING">("HEALTH_CERT")
  const [fileUrl, setFileUrl] = useState("")
  const [useManualUrl, setUseManualUrl] = useState(false)
  const [issuedAt, setIssuedAt] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setType("HEALTH_CERT")
      setFileUrl("")
      setUseManualUrl(false)
      setIssuedAt("")
      setExpiresAt("")
      setNote("")
      setError("")
      setIsLoading(false)
    }
  }, [open])

  const validateForm = () => {
    if (!fileUrl) {
      setError("File URL is required")
      return false
    }

    if (!expiresAt) {
      setError("Expiration date is required")
      return false
    }

    // Validate dates
    if (issuedAt && expiresAt && new Date(expiresAt) < new Date(issuedAt)) {
      setError("Expiration date must be after issue date")
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
      await submitMy(storeId, {
        type,
        fileUrl,
        issuedAt: issuedAt || undefined,
        expiresAt,
        note: note || undefined,
      })
      toast.success("Document submitted successfully")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to submit document:", err)
      const errorMessage = err?.message || "Failed to submit document"
      setError(errorMessage)
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
            <DialogTitle>Submit Compliance Document</DialogTitle>
            <DialogDescription>
              Submit a health certificate or hygiene training document for review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "HEALTH_CERT" | "HYGIENE_TRAINING")}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTH_CERT">Health Certificate</SelectItem>
                  <SelectItem value="HYGIENE_TRAINING">Hygiene Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fileUrl">File *</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useManualUrl"
                    checked={useManualUrl}
                    onCheckedChange={setUseManualUrl}
                    disabled={isLoading}
                  />
                  <Label htmlFor="useManualUrl" className="text-sm cursor-pointer">
                    Use URL instead
                  </Label>
                </div>
              </div>
              {!useManualUrl ? (
                <>
                <UploadButton
                  storeId={storeId}
                  purpose="SUBMISSION"
                  onUploaded={(url) => {
                    setFileUrl(url)
                    setError("")
                  }}
                  accept="application/pdf,image/*,.doc,.docx"
                  label="Upload Document"
                />
                {fileUrl && (
                  <p className="text-xs text-muted-foreground">
                    File uploaded: <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{fileUrl}</a>
                  </p>
                )}
                </>
              ) : (
                <Input
                  id="fileUrl"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => {
                    setFileUrl(e.target.value)
                    setError("")
                  }}
                  placeholder="https://..."
                  required
                  disabled={isLoading}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuedAt">Issue Date (Optional)</Label>
                <Input
                  id="issuedAt"
                  type="date"
                  value={issuedAt}
                  onChange={(e) => {
                    setIssuedAt(e.target.value)
                    setError("")
                  }}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date *</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => {
                    setExpiresAt(e.target.value)
                    setError("")
                  }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional notes..."
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

