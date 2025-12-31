"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { NotificationStatus } from "@/types/notifications"

interface NotificationFiltersProps {
  unreadOnly: boolean
  onUnreadOnlyChange: (value: boolean) => void
  statusFilter: NotificationStatus | "ALL"
  onStatusFilterChange: (value: NotificationStatus | "ALL") => void
}

export function NotificationFilters({
  unreadOnly,
  onUnreadOnlyChange,
  statusFilter,
  onStatusFilterChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center space-x-2">
        <Switch
          id="unread-only"
          checked={unreadOnly}
          onCheckedChange={onUnreadOnlyChange}
        />
        <Label htmlFor="unread-only" className="cursor-pointer">
          Unread only
        </Label>
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as NotificationStatus | "ALL")}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="SENT">Sent</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

