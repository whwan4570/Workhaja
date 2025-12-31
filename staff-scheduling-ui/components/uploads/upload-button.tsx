"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { presignUpload, type UploadPurpose } from "@/lib/uploadsApi"
import { toast } from "sonner"
import { Upload, Loader2 } from "lucide-react"

interface UploadButtonProps {
  storeId: string
  purpose: UploadPurpose
  onUploaded: (fileUrl: string) => void
  accept?: string
  label?: string
  className?: string
}

export function UploadButton({
  storeId,
  purpose,
  onUploaded,
  accept,
  label = "Upload File",
  className,
}: UploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // Step 1: Get presigned URL
      const presignResponse = await presignUpload(storeId, {
        purpose,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      })

      // Step 2: Upload file to S3/R2
      const uploadResponse = await fetch(presignResponse.uploadUrl, {
        method: presignResponse.method || "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      // Step 3: Call callback with file URL
      onUploaded(presignResponse.fileUrl)
      toast.success("File uploaded successfully")
      setProgress(100)
    } catch (error: any) {
      console.error("Upload failed:", error)
      toast.error(error?.message || "Failed to upload file")
    } finally {
      setUploading(false)
      setProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className={className}>
      <Label htmlFor={`upload-${purpose}`}>{label}</Label>
      <div className="flex items-center gap-2 mt-2">
        <Input
          id={`upload-${purpose}`}
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {label}
            </>
          )}
        </Button>
        {uploading && (
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

