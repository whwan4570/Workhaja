/**
 * Change request types and status
 */

export type ChangeRequestType =
  | "SHIFT_TIME_CHANGE"
  | "SHIFT_DROP_REQUEST"
  | "SHIFT_COVER_REQUEST"
  | "SHIFT_SWAP_REQUEST"

export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED"

export interface ChangeRequest {
  id: string
  storeId: string
  type: ChangeRequestType
  status: ChangeRequestStatus
  shiftId: string
  createdById: string
  reviewedById?: string | null
  reviewedAt?: string | null
  effectiveAt?: string | null
  reason?: string | null
  decisionNote?: string | null
  proposedStartTime?: string | null
  proposedEndTime?: string | null
  proposedBreakMins?: number | null
  targetUserId?: string | null
  swapShiftId?: string | null
  createdAt: string
  updatedAt: string
  // Relations (optional, loaded when needed)
  shift?: {
    id: string
    userId: string
    date: string
    startTime: string
    endTime: string
    breakMins: number
    status: string
    user?: {
      id: string
      name: string
      email: string
    }
  }
  createdBy?: {
    id: string
    name: string
    email: string
  }
  reviewedBy?: {
    id: string
    name: string
    email: string
  }
  swapShift?: {
    id: string
    userId: string
    date: string
    startTime: string
    endTime: string
    user?: {
      id: string
      name: string
      email: string
    }
  }
}

export interface ChangeRequestCandidate {
  id: string
  requestId: string
  userId: string
  note?: string | null
  createdAt: string
  userName?: string
  email?: string
}

