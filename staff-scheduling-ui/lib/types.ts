export type UserRole = "OWNER" | "MANAGER" | "WORKER"
export type ShiftStatus = "DRAFT" | "PUBLISHED" | "CANCELED"
export type ScheduleStatus = "OPEN" | "DRAFT" | "PUBLISHED"

export interface Store {
  id: string
  name: string
  timezone: string
  location?: string
  specialCode: string
  myRole: UserRole
}

export interface Member {
  id: string
  name: string
  email: string
  role: UserRole
  status: "ACTIVE" | "INACTIVE"
}

export interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string // ISO date string or YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  breakMinutes: number
  status: ShiftStatus
  // Additional fields from API
  userId?: string
  isCanceled?: boolean
  storeId?: string
  monthId?: string
  user?: {
    id: string
    email: string
    name: string
  }
}
