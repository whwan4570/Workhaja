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
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { createDocument } from "@/lib/documentsApi"
import { UploadButton } from "@/components/uploads/upload-button"
import type { DocumentType } from "@/types/documents"

interface CreateDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  members: Array<{ id: string; name: string; email: string }>
  onSuccess: () => void
}

export function CreateDocumentModal({
  open,
  onOpenChange,
  storeId,
  members,
  onSuccess,
}: CreateDocumentModalProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<DocumentType>("POLICY")
  const [fileUrl, setFileUrl] = useState("")
  const [useManualUrl, setUseManualUrl] = useState(false)
  const [targetAll, setTargetAll] = useState(true)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle("")
      setType("POLICY")
      setFileUrl("")
      setUseManualUrl(false)
      setTargetAll(true)
      setSelectedUserIds([])
      setError("")
      setIsLoading(false)
    }
  }, [open])

  const validateForm = () => {
    if (!title) {
      setError("Title is required")
      return false
    }

    if (!fileUrl) {
      setError("File URL is required")
      return false
    }

    if (!targetAll && selectedUserIds.length === 0) {
      setError("Please select at least one target user or target all members")
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
      await createDocument(storeId, {
        title,
        type,
        fileUrl,
        targetUserIds: targetAll ? "ALL" : selectedUserIds,
      })
      toast.success("Document created successfully")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to create document:", err)
      const errorMessage = err?.message || "Failed to create document"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserId = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
    } else {
      setSelectedUserIds([...selectedUserIds, userId])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>Create a new document and assign it to team members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError("")
                }}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="POLICY">Policy</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
                    purpose="DOCUMENT"
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="targetAll"
                  checked={targetAll}
                  onCheckedChange={(checked) => {
                    setTargetAll(checked === true)
                    if (checked) {
                      setSelectedUserIds([])
                    }
                  }}
                />
                <Label htmlFor="targetAll" className="cursor-pointer">
                  Target all members
                </Label>
              </div>
              {!targetAll && (
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedUserIds.includes(member.id)}
                        onCheckedChange={() => toggleUserId(member.id)}
                      />
                      <Label htmlFor={`member-${member.id}`} className="cursor-pointer text-sm">
                        {member.name} ({member.email})
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

