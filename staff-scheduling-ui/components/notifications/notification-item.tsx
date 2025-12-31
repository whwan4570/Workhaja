"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Notification } from "@/types/notifications"

interface NotificationItemProps {
  notification: Notification
  onMarkRead?: (notificationId: string) => void
  onClick?: (notification: Notification) => void
}

export function NotificationItem({ notification, onMarkRead, onClick }: NotificationItemProps) {
  const isUnread = !notification.readAt

  const typeLabels: Record<string, string> = {
    DOC_EXPIRING_SOON: "Document Expiring",
    DOC_EXPIRED: "Document Expired",
    AVAILABILITY_DEADLINE_SOON: "Availability Deadline",
    SHIFT_REMINDER: "Shift Reminder",
    CHANGE_REQUEST_UPDATED: "Request Updated",
  }

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    SENT: { label: "Sent", variant: "default" },
    PENDING: { label: "Pending", variant: "secondary" },
    FAILED: { label: "Failed", variant: "destructive" },
    CANCELED: { label: "Canceled", variant: "outline" },
  }

  const statusInfo = statusConfig[notification.status] || {
    label: notification.status,
    variant: "outline" as const,
  }

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id)
    }
    if (onClick) {
      onClick(notification)
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-colors ${isUnread ? "bg-muted border-l-4 border-l-primary" : ""}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {isUnread && (
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <Badge variant="outline" className="text-xs">
                {typeLabels[notification.type] || notification.type}
              </Badge>
              <Badge variant={statusInfo.variant} className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

