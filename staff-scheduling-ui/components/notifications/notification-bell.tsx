"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { NotificationList } from "./notification-list"
import { listMy, markRead } from "@/lib/notificationsApi"
import type { Notification } from "@/types/notifications"
import { Bell } from "lucide-react"
import { toast } from "sonner"

interface NotificationBellProps {
  storeId: string | null
}

export function NotificationBell({ storeId }: NotificationBellProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (storeId && open) {
      loadNotifications()
    }
  }, [storeId, open])

  // Poll for unread count periodically when bell is closed
  useEffect(() => {
    if (!storeId || open) return

    const interval = setInterval(() => {
      loadUnreadCount()
    }, 30000) // Poll every 30 seconds

    // Initial load
    loadUnreadCount()

    return () => clearInterval(interval)
  }, [storeId, open])

  const loadNotifications = async () => {
    if (!storeId) return

    setLoading(true)
    try {
      const response = await listMy(storeId, { unread: true, limit: 5 })
      setNotifications(response.items)
      setUnreadCount(response.items.length)
    } catch (err) {
      console.error("Failed to load notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!storeId) return

    try {
      const response = await listMy(storeId, { unread: true, limit: 100 })
      setUnreadCount(response.items.length)
    } catch (err) {
      console.error("Failed to load unread count:", err)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    if (!storeId) return

    try {
      await markRead(storeId, notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark as read")
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    const navigateToNotification = () => {
      switch (notification.type) {
        case "CHANGE_REQUEST_UPDATED":
          router.push("/requests")
          break
        case "DOC_EXPIRING_SOON":
        case "DOC_EXPIRED":
          router.push("/documents")
          break
        case "AVAILABILITY_DEADLINE_SOON":
        case "SHIFT_REMINDER":
          router.push("/schedule")
          break
        default:
          router.push("/notifications")
      }
    }

    navigateToNotification()
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                You're all caught up!
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.readAt && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem onClick={() => router.push("/notifications")}>
            View all notifications
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

