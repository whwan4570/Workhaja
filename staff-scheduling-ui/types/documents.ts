/**
 * Document and submission types
 */

export type DocumentType = "CONTRACT" | "HEALTH_CERT" | "HYGIENE_TRAINING" | "POLICY" | "OTHER"

export type SubmissionStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "EXPIRED"

export interface Document {
  id: string
  storeId: string
  title: string
  type: DocumentType
  version: number
  fileUrl: string
  createdById: string
  createdAt: string
  updatedAt: string
  acknowledgedCurrentVersion?: boolean
  currentVersion?: number
}

export interface DocumentDetail extends Document {
  targets?: Array<{
    userId: string
  }>
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

export interface DocumentSubmission {
  id: string
  storeId: string
  userId: string
  type: DocumentType
  fileUrl: string
  issuedAt?: string | null
  expiresAt?: string | null
  status: SubmissionStatus
  reviewedById?: string | null
  reviewedAt?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  reviewedBy?: {
    id: string
    name: string
    email: string
  }
}

export interface MissingItem {
  userId: string
  name?: string
  email?: string
  missingType: DocumentType
}

