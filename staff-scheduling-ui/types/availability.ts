/**
 * Availability type for schedule unavailability
 */

export interface Availability {
  id: string
  userId: string
  date: string // ISO date string or YYYY-MM-DD
  startTime?: string | null // HH:mm or null for all-day
  endTime?: string | null // HH:mm or null for all-day
  createdAt?: string
  updatedAt?: string
  // Optional user info (for admin view)
  user?: {
    id: string
    email: string
    name: string
  }
}

