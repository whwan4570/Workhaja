# Documents & Compliance UI Implementation

## Overview

This document describes the implementation of UI Step 6: Documents & Compliance UI for both Workers and Managers/Owners.

## Created Files

### Types
1. **`types/documents.ts`**
   - `DocumentType`: CONTRACT | HEALTH_CERT | HYGIENE_TRAINING | POLICY | OTHER
   - `SubmissionStatus`: SUBMITTED | APPROVED | REJECTED | EXPIRED
   - `Document`, `DocumentDetail`, `DocumentSubmission`, `MissingItem` interfaces

### API Clients
2. **`lib/documentsApi.ts`**
   - `listDocuments()` - List documents (filtered by type)
   - `getDocument()` - Get document detail
   - `createDocument()` - Create document
   - `updateDocument()` - Update document
   - `ackDocument()` - Acknowledge document

3. **`lib/submissionsApi.ts`**
   - `submitMy()` - Submit compliance document (Worker)
   - `listMy()` - List my submissions (Worker)
   - `adminList()` - List all submissions (Admin)
   - `approve()` - Approve submission (Admin)
   - `reject()` - Reject submission (Admin)
   - `expiring()` - Get expiring submissions (Admin)
   - `expired()` - Get expired submissions (Admin)

### Components
4. **`components/documents/document-card.tsx`**
   - Document card with ack button
   - Shows status badge (Acknowledged/Needs Ack)

5. **`components/documents/submit-compliance-modal.tsx`**
   - Modal for submitting health cert/training
   - Form with type, fileUrl, issuedAt, expiresAt, note

6. **`components/documents/create-document-modal.tsx`**
   - Modal for creating documents (Admin)
   - Target all members or select specific users

7. **`components/documents/review-submission-row.tsx`**
   - Row component for reviewing submissions
   - Shows status, expiration state, approve/reject buttons

### Pages
8. **`app/documents/page.tsx`**
   - Main documents page with 4 tabs
   - Role-based tab visibility
   - Complete workflow for both workers and admins

## Features

### Tab 1: My Documents (All Users)
- List of assigned documents
- Each document shows:
  - Title, type badge, version
  - Status: "Acknowledged" or "Needs Ack"
  - "Open" button (opens fileUrl in new tab)
  - "Acknowledge" button (if needs ack)
- After acknowledgment, status updates and toast shown

### Tab 2: My Compliance (All Users)
- List of my submissions
- "Submit Document" button opens modal
- Submission card shows:
  - Type (Health Cert / Hygiene Training)
  - Status badge (SUBMITTED/APPROVED/REJECTED/EXPIRED)
  - Expiration date
  - "Expired" or "Expiring Soon" badges (derived from expiresAt)
  - Rejection note (if REJECTED)
  - "View" button to open file

### Tab 3: Admin: Documents (OWNER/MANAGER only)
- List of all documents with type filter
- "Create Document" button
- Each document shows:
  - Title, type, version
  - Created date
  - "Open" and "Edit" buttons
- Edit modal allows:
  - Update title
  - Update fileUrl (version increments)
  - Retarget members (all or specific)

### Tab 4: Admin: Compliance Review (OWNER/MANAGER only)
- Type and status filters
- Four sections:
  1. **Submitted (Needs Review)**: List of SUBMITTED submissions
     - Approve/Reject buttons
     - Reject opens dialog with decision note
  2. **Expiring Soon**: Submissions expiring within 30 days
  3. **Expired**: Expired submissions
  4. **Missing**: Missing documents (if backend supports)
     - Shows banner if feature not available
- Each submission row shows:
  - User name, type, status
  - Expiration state badges
  - View, Approve, Reject buttons

## API Endpoints Used

### Documents
- `GET /stores/:storeId/documents?type=`
- `GET /stores/:storeId/documents/:documentId`
- `POST /stores/:storeId/documents`
- `PUT /stores/:storeId/documents/:documentId`
- `POST /stores/:storeId/documents/:documentId/ack`

### Submissions
- `POST /stores/:storeId/me/submissions` (Worker)
- `GET /stores/:storeId/me/submissions` (Worker)
- `GET /stores/:storeId/submissions?type=&status=&missing=` (Admin)
- `POST /stores/:storeId/submissions/:submissionId/approve` (Admin)
- `POST /stores/:storeId/submissions/:submissionId/reject` (Admin)
- `GET /stores/:storeId/submissions/expiring?type=&days=30` (Admin)
- `GET /stores/:storeId/submissions/expired?type=` (Admin)

### Members
- `GET /stores/:storeId/members` (for targeting)

## Error Handling

- **401**: Handled globally by axios interceptor (redirects to login)
- **403**: Shows "You don't have permission" message
- **400**: Shows validation error (e.g., "Expiration date is required")
- **404**: Graceful fallback:
  - Missing list: Shows banner "Missing list is not available on server"
  - Expiring/Expired endpoints: Returns empty array

## UI/UX Features

- Loading states with spinners
- Empty states with helpful messages
- Toast notifications for success/error
- Status badges with appropriate colors
- Expiration state detection (Expired/Expiring Soon)
- Role-based tab visibility
- Responsive layout

## Testing Plan

### Worker Flow
1. **View Documents**
   - Login as Worker
   - Go to `/documents`
   - See "My Documents" tab
   - View assigned documents
   - Click "Acknowledge" on a document
   - Verify status changes to "Acknowledged"

2. **Submit Compliance**
   - Go to "My Compliance" tab
   - Click "Submit Document"
   - Fill form: type=HEALTH_CERT, fileUrl, expiresAt
   - Submit
   - Verify submission appears in list with SUBMITTED status

### Admin Flow
1. **Create Document**
   - Login as Manager/Owner
   - Go to `/documents`
   - Go to "Admin: Documents" tab
   - Click "Create Document"
   - Fill: title, type=CONTRACT, fileUrl, target specific worker
   - Create
   - Verify document appears in list

2. **Worker Sees Document**
   - Login as targeted Worker
   - Go to `/documents`
   - Verify new document appears with "Needs Ack" status

3. **Review Compliance**
   - Login as Manager/Owner
   - Go to "Admin: Compliance Review" tab
   - See SUBMITTED submission
   - Click "Approve"
   - Verify submission status changes to APPROVED
   - Worker sees APPROVED status in "My Compliance"

4. **View Expiring/Expired**
   - In "Admin: Compliance Review"
   - Verify "Expiring Soon" section shows submissions expiring within 30 days
   - Verify "Expired" section shows expired submissions

## Files Changed/Created

### Created
- `types/documents.ts`
- `lib/documentsApi.ts`
- `lib/submissionsApi.ts`
- `components/documents/document-card.tsx`
- `components/documents/submit-compliance-modal.tsx`
- `components/documents/create-document-modal.tsx`
- `components/documents/review-submission-row.tsx`
- `app/documents/page.tsx`

### Modified
- None (sidebar already has Documents link)

## Running the Application

```bash
# Backend
cd /Users/joon/shiftory-api
npm run start:dev

# Frontend
cd /Users/joon/Downloads/staff-scheduling-ui
npm run dev
```

Frontend: http://localhost:3001
Backend: http://localhost:3000

## Notes

- All code comments are in English
- Error handling is comprehensive
- UI is consistent with existing pages
- Role-based access is properly enforced
- Missing features gracefully degrade if endpoints are not available
- Expiration state is calculated client-side for immediate feedback

