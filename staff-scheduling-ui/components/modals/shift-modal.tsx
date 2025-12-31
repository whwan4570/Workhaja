"use client"

import type React from "react"

import { useState } from "react"
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
import { mockMembers } from "@/lib/mock-data"

interface ShiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: {
    employeeId: string
    date: string
    startTime: string
    endTime: string
    breakMinutes: number
  }) => void
  editMode?: boolean
}

export function ShiftModal({ open, onOpenChange, onSubmit, editMode = false }: ShiftModalProps) {
  const [employeeId, setEmployeeId] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [breakMinutes, setBreakMinutes] = useState("30")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      employeeId,
      date,
      startTime,
      endTime,
      breakMinutes: Number.parseInt(breakMinutes),
    })
    // Reset form
    setEmployeeId("")
    setDate("")
    setStartTime("")
    setEndTime("")
    setBreakMinutes("30")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Shift" : "Add Shift"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update shift details." : "Create a new shift for an employee."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId} required>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers
                    .filter((m) => m.role === "WORKER")
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakMinutes">Break Minutes</Label>
              <Input
                id="breakMinutes"
                type="number"
                min="0"
                step="15"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editMode ? "Update" : "Create"} Shift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
