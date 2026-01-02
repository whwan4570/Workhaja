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

interface CreateStoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function CreateStoreModal({ open, onOpenChange, onSubmit }: CreateStoreModalProps) {
  const [name, setName] = useState("")
  const [timezone, setTimezone] = useState("America/New_York")
  const [location, setLocation] = useState("")
  const [specialCode, setSpecialCode] = useState("")

  // Generate a random special code if empty
  const generateSpecialCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setSpecialCode(code)
  }

  // Generate code on mount if empty
  useEffect(() => {
    if (open && !specialCode) {
      generateSpecialCode()
    }
  }, [open, specialCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!specialCode || specialCode.length < 4) {
      alert('Special code must be at least 4 characters')
      return
    }
    onSubmit?.({ name, timezone, location: location || undefined, specialCode })
    setName("")
    setTimezone("America/New_York")
    setLocation("")
    setSpecialCode("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
            <DialogDescription>Add a new store location to your organization.</DialogDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="specialCode">Special Code</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateSpecialCode}
                  className="h-7 text-xs"
                >
                  Generate
                </Button>
              </div>
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
            <Button type="submit">Create Store</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
