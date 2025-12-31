"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Document } from "@/types/documents"
import { ExternalLink, CheckCircle2, Clock } from "lucide-react"

interface DocumentCardProps {
  document: Document
  onAck?: (documentId: string) => void
  isAcking?: boolean
}

export function DocumentCard({ document, onAck, isAcking }: DocumentCardProps) {
  const typeLabels: Record<string, string> = {
    CONTRACT: "Contract",
    POLICY: "Policy",
    HEALTH_CERT: "Health Cert",
    HYGIENE_TRAINING: "Hygiene Training",
    OTHER: "Other",
  }

  const needsAck = !document.acknowledgedCurrentVersion

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{document.title}</h4>
              <Badge variant="outline">{typeLabels[document.type] || document.type}</Badge>
              <Badge variant="secondary">v{document.version}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {needsAck ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Needs Ack
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Acknowledged
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.fileUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
            {needsAck && onAck && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onAck(document.id)}
                disabled={isAcking}
              >
                {isAcking ? "Acknowledging..." : "Acknowledge"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

