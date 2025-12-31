"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { DocumentSubmission } from "@/types/documents"
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react"
import { formatYMD } from "@/lib/date"

interface ReviewSubmissionRowProps {
  submission: DocumentSubmission
  onApprove: (submissionId: string) => void
  onReject: (submissionId: string) => void
  isProcessing?: boolean
}

export function ReviewSubmissionRow({
  submission,
  onApprove,
  onReject,
  isProcessing,
}: ReviewSubmissionRowProps) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    SUBMITTED: { label: "Submitted", variant: "secondary" },
    APPROVED: { label: "Approved", variant: "default" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    EXPIRED: { label: "Expired", variant: "outline" },
  }

  const typeLabels: Record<string, string> = {
    HEALTH_CERT: "Health Cert",
    HYGIENE_TRAINING: "Hygiene Training",
  }

  const statusInfo = statusConfig[submission.status] || { label: submission.status, variant: "outline" as const }

  // Check if expired or expiring soon
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiresAt = submission.expiresAt ? new Date(submission.expiresAt) : null
  const isExpired = expiresAt && expiresAt < today
  const isExpiringSoon =
    expiresAt &&
    !isExpired &&
    expiresAt.getTime() - today.getTime() <= 30 * 24 * 60 * 60 * 1000

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{submission.user?.name || submission.userId}</span>
          <Badge variant="outline">{typeLabels[submission.type] || submission.type}</Badge>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          {isExpired && <Badge variant="destructive">Expired</Badge>}
          {isExpiringSoon && !isExpired && <Badge variant="secondary">Expiring Soon</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          {submission.expiresAt && (
            <span>
              Expires: {new Date(submission.expiresAt).toLocaleDateString()}
              {submission.issuedAt && ` (Issued: ${new Date(submission.issuedAt).toLocaleDateString()})`}
            </span>
          )}
        </div>
        {submission.status === "REJECTED" && submission.note && (
          <div className="text-sm text-red-600">Note: {submission.note}</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(submission.fileUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View
        </Button>
        {submission.status === "SUBMITTED" && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(submission.id)}
              disabled={isProcessing}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject(submission.id)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

