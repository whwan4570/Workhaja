"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Shift } from "@/lib/types"
import { MoreHorizontal, Clock } from "lucide-react"

interface ShiftCardProps {
  shift: Shift
  onEdit?: (shiftId: string) => void
  onCancel?: (shiftId: string) => void
  onDelete?: (shiftId: string) => void
  onSelect?: (shiftId: string) => void
}

export function ShiftCard({ shift, onEdit, onCancel, onDelete, onSelect }: ShiftCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={() => onSelect?.(shift.id)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">{shift.employeeName}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {shift.startTime} – {shift.endTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{shift.breakMinutes} min break</Badge>
              <Badge
                variant={
                  shift.status === "PUBLISHED" ? "default" : shift.status === "DRAFT" ? "secondary" : "destructive"
                }
              >
                {shift.status}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(shift.id)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCancel?.(shift.id)}>Cancel shift</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(shift.id)} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
