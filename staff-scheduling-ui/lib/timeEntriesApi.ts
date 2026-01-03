/**
 * Time Entries API client
 */

import { apiRequest } from "./api"

export type TimeEntryType = "CHECK_IN" | "CHECK_OUT"
export type TimeEntryStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED"

export interface TimeEntry {
  id: string
  storeId: string
  userId: string
  shiftId?: string
  type: TimeEntryType
  status: TimeEntryStatus
  timestamp: string // Server time
  clientTimestamp?: string // Client time (reference only)
  latitude?: number
  longitude?: number
  distanceMiles?: number
  locationVerified: boolean
  reviewedById?: string
  reviewedAt?: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string
  }
  shift?: {
    id: string
    date: string
    startTime: string
    endTime: string
  }
  reviewedBy?: {
    id: string
    email: string
    name: string
  }
}

export interface CreateTimeEntryDto {
  type: TimeEntryType
  shiftId?: string
  latitude?: number
  longitude?: number
  clientTimestamp?: string
}

export interface ReviewTimeEntryDto {
  status: "APPROVED" | "REJECTED"
  reviewNote?: string
}

/**
 * Create a time entry (check-in or check-out)
 */
export async function createTimeEntry(
  storeId: string,
  data: CreateTimeEntryDto
): Promise<TimeEntry> {
  return apiRequest<TimeEntry>(`/stores/${storeId}/time-entries`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * List time entries
 */
export async function listTimeEntries(
  storeId: string,
  params?: {
    userId?: string
    status?: TimeEntryStatus
  }
): Promise<TimeEntry[]> {
  const queryParams = new URLSearchParams()
  if (params?.userId) {
    queryParams.append("userId", params.userId)
  }
  if (params?.status) {
    queryParams.append("status", params.status)
  }

  const query = queryParams.toString()
  return apiRequest<TimeEntry[]>(
    `/stores/${storeId}/time-entries${query ? `?${query}` : ""}`
  )
}

/**
 * Get pending time entries (for managers/owners)
 */
export async function getPendingTimeEntries(
  storeId: string
): Promise<TimeEntry[]> {
  return apiRequest<TimeEntry[]>(`/stores/${storeId}/time-entries/pending`)
}

/**
 * Review (approve/reject) a time entry
 */
export async function reviewTimeEntry(
  storeId: string,
  timeEntryId: string,
  data: ReviewTimeEntryDto
): Promise<TimeEntry> {
  return apiRequest<TimeEntry>(
    `/stores/${storeId}/time-entries/${timeEntryId}/review`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

/**
 * Get current GPS position
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

