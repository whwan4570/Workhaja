"use client"

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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CopyMonthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  toYear: number
  toMonth: number
  onCopy: (fromYear: number, fromMonth: number) => Promise<void>
  isCopying?: boolean
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function CopyMonthModal({
  open,
  onOpenChange,
  storeId,
  toYear,
  toMonth,
  onCopy,
  isCopying = false,
}: CopyMonthModalProps) {
  // Calculate previous month
  const getPreviousMonth = () => {
    let fromYear = toYear
    let fromMonth = toMonth - 1
    if (fromMonth < 1) {
      fromMonth = 12
      fromYear = toYear - 1
    }
    return { year: fromYear, month: fromMonth }
  }

  const prevMonth = getPreviousMonth()
  const [fromYear, setFromYear] = useState(prevMonth.year)
  const [fromMonth, setFromMonth] = useState(prevMonth.month)

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear()
  const yearOptions: number[] = []
  for (let y = currentYear; y >= currentYear - 2; y--) {
    yearOptions.push(y)
  }

  const handleCopy = async () => {
    await onCopy(fromYear, fromMonth)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy Shifts from Previous Month</DialogTitle>
          <DialogDescription>
            Copy shifts from a previous month to {monthNames[toMonth - 1]} {toYear}. Only non-canceled shifts will be copied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will copy all non-canceled shifts from the selected month. Existing shifts in the target month will not be overwritten.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Copy from Month</Label>
            <div className="flex gap-2">
              <Select
                value={String(fromYear)}
                onValueChange={(v) => setFromYear(Number.parseInt(v, 10))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(fromMonth)}
                onValueChange={(v) => setFromMonth(Number.parseInt(v, 10))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index + 1} value={String(index + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Shifts will be copied to: <strong>{monthNames[toMonth - 1]} {toYear}</strong>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCopying}>
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={isCopying}>
            {isCopying ? "Copying..." : "Copy Shifts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

