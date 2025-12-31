/**
 * Document submissions API client
 */

import { apiRequest } from "./api"
import type { DocumentSubmission, DocumentType, SubmissionStatus, MissingItem } from "@/types/documents"

export interface SubmitComplianceDto {
  type: "HEALTH_CERT" | "HYGIENE_TRAINING"
  fileUrl: string
  issuedAt?: string
  expiresAt: string
  note?: string
}

export interface ApproveSubmissionDto {
  decisionNote?: string
}

export interface RejectSubmissionDto {
  decisionNote?: string
}

/**
 * Submit a compliance document (Worker)
 * @param storeId - Store ID
 * @param payload - Submission data
 * @returns Created submission
 */
export async function submitMy(
  storeId: string,
  payload: SubmitComplianceDto
): Promise<DocumentSubmission> {
  return apiRequest<DocumentSubmission>(`/stores/${storeId}/me/submissions`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/**
 * List my submissions (Worker)
 * @param storeId - Store ID
 * @returns Array of submissions
 */
export async function listMy(storeId: string): Promise<DocumentSubmission[]> {
  return apiRequest<DocumentSubmission[]>(`/stores/${storeId}/me/submissions`)
}

/**
 * List all submissions (Admin)
 * @param storeId - Store ID
 * @param params - Query parameters
 * @returns Array of submissions
 */
export async function adminList(
  storeId: string,
  params?: {
    type?: DocumentType
    status?: SubmissionStatus
    state?: "EXPIRING_SOON" | "EXPIRED"
    missing?: boolean
  }
): Promise<DocumentSubmission[] | { submissions: DocumentSubmission[]; missing?: MissingItem[] }> {
  const queryParams = new URLSearchParams()
  if (params?.type) {
    queryParams.append("type", params.type)
  }
  if (params?.status) {
    queryParams.append("status", params.status)
  }
  if (params?.state) {
    queryParams.append("state", params.state)
  }
  if (params?.missing) {
    queryParams.append("missing", "true")
  }

  const queryString = queryParams.toString()
  const url = `/stores/${storeId}/submissions${queryString ? `?${queryString}` : ""}`

  return apiRequest<DocumentSubmission[] | { submissions: DocumentSubmission[]; missing?: MissingItem[] }>(url)
}

/**
 * Approve a submission (Admin)
 * @param storeId - Store ID
 * @param submissionId - Submission ID
 * @param payload - Approval data
 * @returns Updated submission
 */
export async function approve(
  storeId: string,
  submissionId: string,
  payload?: ApproveSubmissionDto
): Promise<DocumentSubmission> {
  return apiRequest<DocumentSubmission>(`/stores/${storeId}/submissions/${submissionId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}

/**
 * Reject a submission (Admin)
 * @param storeId - Store ID
 * @param submissionId - Submission ID
 * @param payload - Rejection data
 * @returns Updated submission
 */
export async function reject(
  storeId: string,
  submissionId: string,
  payload?: RejectSubmissionDto
): Promise<DocumentSubmission> {
  return apiRequest<DocumentSubmission>(`/stores/${storeId}/submissions/${submissionId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}

/**
 * Get expiring submissions (Admin)
 * @param storeId - Store ID
 * @param type - Optional document type
 * @param days - Days threshold (default: 30)
 * @returns Array of expiring submissions
 */
export async function expiring(
  storeId: string,
  type?: DocumentType,
  days: number = 30
): Promise<DocumentSubmission[]> {
  try {
    const url = type
      ? `/stores/${storeId}/submissions/expiring?type=${type}&days=${days}`
      : `/stores/${storeId}/submissions/expiring?days=${days}`
    return apiRequest<DocumentSubmission[]>(url)
  } catch (error: any) {
    if (error?.message?.includes("404") || error?.statusCode === 404) {
      return []
    }
    throw error
  }
}

/**
 * Get expired submissions (Admin)
 * @param storeId - Store ID
 * @param type - Optional document type
 * @returns Array of expired submissions
 */
export async function expired(storeId: string, type?: DocumentType): Promise<DocumentSubmission[]> {
  try {
    const url = type
      ? `/stores/${storeId}/submissions/expired?type=${type}`
      : `/stores/${storeId}/submissions/expired`
    return apiRequest<DocumentSubmission[]>(url)
  } catch (error: any) {
    if (error?.message?.includes("404") || error?.statusCode === 404) {
      return []
    }
    throw error
  }
}

