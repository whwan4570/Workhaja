"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatMinutes } from "@/lib/reportsApi"
import { getMyWeeklySummary, getMyMonthlySummary } from "@/lib/reportsApi"
import { getShifts } from "@/lib/schedulingApi"
import { formatYMD, getWeekRange, getMonthRange } from "@/lib/date"
import { getStoreId } from "@/lib/api"
import { getWeekStartsOn } from "@/lib/settingsApi"
import { Clock, BarChart3, AlertCircle } from "lucide-react"

interface TodayShift {
  startTime: string
  endTime: string
}

export function TimeSummaryCard({ collapsed }: { collapsed: boolean }) {
  const [todayShift, setTodayShift] = useState<TodayShift | null>(null)
  const [weeklyTotal, setWeeklyTotal] = useState<number | null>(null)
  const [weeklyOT, setWeeklyOT] = useState<number | null>(null)
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null)
  const [monthlyOT, setMonthlyOT] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const storeId = getStoreId()
      if (!storeId) {
        setLoading(false)
        return
      }

      const today = new Date()
      const todayYMD = formatYMD(today)

      // Get today's shift
      try {
        const shifts = await getShifts(storeId, todayYMD, todayYMD)
        const myShift = shifts.find((s) => !s.isCanceled && s.status === "PUBLISHED")
        if (myShift) {
          setTodayShift({
            startTime: myShift.startTime,
            endTime: myShift.endTime,
          })
        } else {
          setTodayShift(null)
        }
      } catch (err) {
        console.error("Failed to load today's shift:", err)
      }

      // Get week starts on setting
      let weekStartsOn = 1
      try {
        weekStartsOn = await getWeekStartsOn(storeId)
      } catch (err) {
        console.error("Failed to load weekStartsOn:", err)
      }

      // Get weekly summary
      try {
        const weekRange = getWeekRange(today, weekStartsOn)
        const weeklySummary = await getMyWeeklySummary(storeId, weekRange.from, weekRange.to)
        setWeeklyTotal(weeklySummary.totalMins)
        setWeeklyOT(weeklySummary.overtimeMins)
      } catch (err) {
        console.error("Failed to load weekly summary:", err)
      }

      // Get monthly summary
      try {
        const monthRange = getMonthRange(today.getFullYear(), today.getMonth() + 1)
        const monthlySummary = await getMyMonthlySummary(
          storeId,
          today.getFullYear(),
          today.getMonth() + 1
        )
        setMonthlyTotal(monthlySummary.totalMins)
        setMonthlyOT(monthlySummary.overtimeMins)
      } catch (err) {
        console.error("Failed to load monthly summary:", err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  if (collapsed) {
    return null
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTime = (time: string) => {
    // time is in HH:mm format
    const [hours, minutes] = time.split(":")
    const hour12 = parseInt(hours) % 12 || 12
    const ampm = parseInt(hours) >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="p-4 border-t">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Today's Shift */}
          {todayShift ? (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Today's Shift</div>
              <div className="text-sm font-medium">
                {formatTime(todayShift.startTime)} - {formatTime(todayShift.endTime)}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Today's Shift</div>
              <div className="text-sm text-muted-foreground">No shift scheduled</div>
            </div>
          )}

          {/* Weekly Summary */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">This Week</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {weeklyTotal !== null ? formatMinutes(weeklyTotal) : "—"}
              </span>
              {weeklyOT !== null && weeklyOT > 0 && (
                <Badge variant="secondary" className="text-xs">
                  OT: {formatMinutes(weeklyOT)}
                </Badge>
              )}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">This Month</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {monthlyTotal !== null ? formatMinutes(monthlyTotal) : "—"}
              </span>
              {monthlyOT !== null && monthlyOT > 0 && (
                <Badge variant="secondary" className="text-xs">
                  OT: {formatMinutes(monthlyOT)}
                </Badge>
              )}
            </div>
          </div>

          {/* Reports Link */}
          <Link href="/reports" className="block">
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

