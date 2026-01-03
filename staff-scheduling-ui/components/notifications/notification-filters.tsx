"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface NotificationFiltersProps {
  unreadOnly: boolean
  onUnreadOnlyChange: (value: boolean) => void
}

export function NotificationFilters({
  unreadOnly,
  onUnreadOnlyChange,
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
    </div>
  )
}

