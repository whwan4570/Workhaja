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

interface EditStoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: {
    id: string
    name: string
    timezone: string
    location?: string
    specialCode: string
  } | null
  onSubmit?: (data: { name: string; timezone: string; location?: string; specialCode: string }) => void
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
]

export function EditStoreModal({ open, onOpenChange, store, onSubmit }: EditStoreModalProps) {
  const [name, setName] = useState("")
  const [timezone, setTimezone] = useState("America/New_York")
  const [location, setLocation] = useState("")
  const [specialCode, setSpecialCode] = useState("")

  useEffect(() => {
    if (store && open) {
      setName(store.name)
      setTimezone(store.timezone)
      setLocation(store.location || "")
      setSpecialCode(store.specialCode)
    }
  }, [store, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialCode || specialCode.length < 4) {
      alert('Special code must be at least 4 characters')
      return
    }
    if (!store) return
    onSubmit?.({ name, timezone, location: location || undefined, specialCode })
    onOpenChange(false)
  }

  if (!store) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>Update store information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="e.g., Downtown Location"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., 123 Main St, New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialCode">Special Code</Label>
              <Input
                id="specialCode"
                placeholder="e.g., STORE-ABC123"
                value={specialCode}
                onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
                minLength={4}
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique code to identify this store (4-20 characters, alphanumeric)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

