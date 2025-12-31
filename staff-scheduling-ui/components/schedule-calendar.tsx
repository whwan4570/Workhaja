"use client"

import { cn } from "@/lib/utils"
import { formatYMD } from "@/lib/date"
import type { Availability } from "@/types/availability"

interface ScheduleCalendarProps {
  year: number
  month: number
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  availabilityByDate?: Record<string, Availability[]>
  userId?: string | null
}

export function ScheduleCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  availabilityByDate = {},
  userId,
}: ScheduleCalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="rounded-lg border p-4">
      {/* Week days header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map((day) => {
          const date = new Date(year, month - 1, day)
          const dateKey = formatYMD(date)
          const isSelected =
            selectedDate?.getDate() === day &&
            selectedDate?.getMonth() === month - 1 &&
            selectedDate?.getFullYear() === year
          const isToday =
            new Date().getDate() === day && new Date().getMonth() === month - 1 && new Date().getFullYear() === year

          // Check if user has availability on this date
          const dayAvailability = availabilityByDate[dateKey] || []
          const myAvailability = userId
            ? dayAvailability.find((avail) => avail.userId === userId)
            : null
          const hasAvailability = !!myAvailability

          return (
            <button
              key={day}
              onClick={() => onSelectDate(date)}
              className={cn(
                "aspect-square rounded-md text-sm transition-colors hover:bg-accent relative flex flex-col items-center justify-center",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isToday && !isSelected && "border border-primary",
              )}
            >
              <span>{day}</span>
              {hasAvailability && (
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-amber-500",
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
