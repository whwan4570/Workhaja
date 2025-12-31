/**
 * Uploads API client
 */

import { apiRequest } from "./api"

export type UploadPurpose = "DOCUMENT" | "SUBMISSION"

export interface PresignUploadDto {
  purpose: UploadPurpose
  filename: string
  contentType: string
}

export interface PresignUploadResponse {
  uploadUrl: string
  fileUrl: string
  method: string
}

/**
 * Get presigned URL for file upload
 * @param storeId - Store ID
 * @param payload - Upload request data
 * @returns Presigned URL and file URL
 */
export async function presignUpload(
  storeId: string,
  payload: PresignUploadDto
): Promise<PresignUploadResponse> {
  return apiRequest<PresignUploadResponse>(`/stores/${storeId}/uploads/presign`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

