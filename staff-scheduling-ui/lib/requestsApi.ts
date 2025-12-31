/**
 * Change Requests API client
 */

import { apiRequest } from "./api"
import type {
  ChangeRequest,
  ChangeRequestType,
  ChangeRequestStatus,
  ChangeRequestCandidate,
} from "@/types/requests"

export interface CreateChangeRequestDto {
  type: ChangeRequestType
  shiftId: string
  proposedStartTime?: string
  proposedEndTime?: string
  proposedBreakMins?: number
  swapShiftId?: string
  reason?: string
}

export interface ApproveChangeRequestDto {
  chosenUserId?: string
  decisionNote?: string
}

export interface RejectChangeRequestDto {
  decisionNote?: string
}

/**
 * List change requests
 * @param storeId - Store ID
 * @param params - Query parameters
 * @returns Array of change requests
 */
export async function listRequests(
  storeId: string,
  params?: {
    status?: ChangeRequestStatus
    type?: ChangeRequestType
    mine?: boolean
  }
): Promise<ChangeRequest[]> {
  const queryParams = new URLSearchParams()
  if (params?.status) {
    queryParams.append("status", params.status)
  }
  if (params?.type) {
    queryParams.append("type", params.type)
  }
  if (params?.mine) {
    queryParams.append("mine", "true")
  }

  const queryString = queryParams.toString()
  const url = `/stores/${storeId}/requests${queryString ? `?${queryString}` : ""}`

  return apiRequest<ChangeRequest[]>(url)
}

/**
 * Get change request detail
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @returns Change request
 */
export async function getRequest(storeId: string, requestId: string): Promise<ChangeRequest> {
  return apiRequest<ChangeRequest>(`/stores/${storeId}/requests/${requestId}`)
}

/**
 * Create a change request
 * @param storeId - Store ID
 * @param payload - Change request data
 * @returns Created change request
 */
export async function createRequest(
  storeId: string,
  payload: CreateChangeRequestDto
): Promise<ChangeRequest> {
  return apiRequest<ChangeRequest>(`/stores/${storeId}/requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/**
 * Approve a change request
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @param payload - Approval data
 * @returns Updated change request
 */
export async function approveRequest(
  storeId: string,
  requestId: string,
  payload?: ApproveChangeRequestDto
): Promise<ChangeRequest> {
  return apiRequest<ChangeRequest>(`/stores/${storeId}/requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}

/**
 * Reject a change request
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @param payload - Rejection data
 * @returns Updated change request
 */
export async function rejectRequest(
  storeId: string,
  requestId: string,
  payload?: RejectChangeRequestDto
): Promise<ChangeRequest> {
  return apiRequest<ChangeRequest>(`/stores/${storeId}/requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}

/**
 * Cancel a change request
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @returns Success response
 */
export async function cancelRequest(storeId: string, requestId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/stores/${storeId}/requests/${requestId}/cancel`, {
    method: "POST",
  })
}

/**
 * List candidates for a cover request
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @returns Array of candidates
 */
export async function listCandidates(
  storeId: string,
  requestId: string
): Promise<ChangeRequestCandidate[]> {
  try {
    return apiRequest<ChangeRequestCandidate[]>(
      `/stores/${storeId}/requests/${requestId}/candidates`
    )
  } catch (error: any) {
    // If 404, candidates feature is not enabled
    if (error?.message?.includes("404") || error?.statusCode === 404) {
      return []
    }
    throw error
  }
}

/**
 * Add current user as a candidate for a cover request
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @param note - Optional note
 * @returns Created candidate
 */
export async function addCandidate(
  storeId: string,
  requestId: string,
  note?: string
): Promise<ChangeRequestCandidate> {
  return apiRequest<ChangeRequestCandidate>(`/stores/${storeId}/requests/${requestId}/candidates`, {
    method: "POST",
    body: JSON.stringify({ note: note || undefined }),
  })
}

/**
 * Remove a candidate (withdraw from cover request)
 * @param storeId - Store ID
 * @param requestId - Request ID
 * @param candidateId - Candidate ID
 * @returns Success response
 */
export async function removeCandidate(
  storeId: string,
  requestId: string,
  candidateId: string
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(
    `/stores/${storeId}/requests/${requestId}/candidates/${candidateId}`,
    {
      method: "DELETE",
    }
  )
}

