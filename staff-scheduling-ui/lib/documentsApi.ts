/**
 * Documents API client
 */

import { apiRequest } from "./api"
import type { Document, DocumentDetail, DocumentType } from "@/types/documents"

export interface CreateDocumentDto {
  title: string
  type: DocumentType
  fileUrl: string
  targetUserIds: string[] | "ALL"
}

export interface UpdateDocumentDto {
  title?: string
  fileUrl?: string
  targetUserIds?: string[] | "ALL"
}

/**
 * List documents
 * @param storeId - Store ID
 * @param type - Optional document type filter
 * @returns Array of documents
 */
export async function listDocuments(
  storeId: string,
  type?: DocumentType
): Promise<Document[]> {
  const url = type
    ? `/stores/${storeId}/documents?type=${type}`
    : `/stores/${storeId}/documents`
  return apiRequest<Document[]>(url)
}

/**
 * Get document detail
 * @param storeId - Store ID
 * @param documentId - Document ID
 * @returns Document detail
 */
export async function getDocument(storeId: string, documentId: string): Promise<DocumentDetail> {
  return apiRequest<DocumentDetail>(`/stores/${storeId}/documents/${documentId}`)
}

/**
 * Create a document
 * @param storeId - Store ID
 * @param payload - Document creation data
 * @returns Created document
 */
export async function createDocument(
  storeId: string,
  payload: CreateDocumentDto
): Promise<Document> {
  return apiRequest<Document>(`/stores/${storeId}/documents`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/**
 * Update a document
 * @param storeId - Store ID
 * @param documentId - Document ID
 * @param payload - Document update data
 * @returns Updated document
 */
export async function updateDocument(
  storeId: string,
  documentId: string,
  payload: UpdateDocumentDto
): Promise<Document> {
  return apiRequest<Document>(`/stores/${storeId}/documents/${documentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

/**
 * Acknowledge a document
 * @param storeId - Store ID
 * @param documentId - Document ID
 * @returns Success response
 */
export async function ackDocument(storeId: string, documentId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/stores/${storeId}/documents/${documentId}/ack`, {
    method: "POST",
  })
}

