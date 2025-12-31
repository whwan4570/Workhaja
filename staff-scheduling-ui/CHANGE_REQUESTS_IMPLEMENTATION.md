# Change Requests Workflow Implementation

## Overview

This document describes the implementation of the Change Requests workflow for both backend and frontend.

## Backend Status

The backend is **already implemented** with the following modules:
- `src/change-requests/` - Change requests module
- `src/change-requests/change-requests.service.ts` - Business logic
- `src/change-requests/change-requests.controller.ts` - API endpoints
- `src/change-requests/audit.service.ts` - Audit logging
- Prisma schema includes `ChangeRequest`, `ChangeRequestCandidate`, and `AuditLog` models

## Frontend Implementation

### Created Files

1. **`types/requests.ts`**
   - Type definitions for change requests
   - `ChangeRequestType`, `ChangeRequestStatus`, `ChangeRequest` interface

2. **`lib/requestsApi.ts`**
   - API client functions:
     - `listRequests()` - List change requests with filters
     - `getRequest()` - Get request detail
     - `createRequest()` - Create new request
     - `approveRequest()` - Approve request (Manager/Owner)
     - `rejectRequest()` - Reject request (Manager/Owner)
     - `cancelRequest()` - Cancel request (creator)

3. **`app/requests/page.tsx`**
   - Requests queue page
   - Status filters (ALL, PENDING, APPROVED, REJECTED, CANCELED)
   - Role-based view (Workers see only their requests)
   - Approve/Reject modals for Managers/Owners
   - Cancel button for creators

4. **`components/modals/request-change-modal.tsx`**
   - Modal for creating SHIFT_TIME_CHANGE requests
   - Form with proposed start/end time and break minutes
   - Optional reason field
   - Validation and error handling

### Modified Files

1. **`app/schedule/page.tsx`**
   - Added "Request Change" button on published shifts
   - Only visible for:
     - Worker's own shifts
     - Published shifts
     - Published month status
   - Opens RequestChangeModal

## API Endpoints Used

### Backend Endpoints (Already Implemented)

1. **POST /stores/:storeId/requests**
   - Create a change request
   - Body: `{ type, shiftId, proposedStartTime?, proposedEndTime?, proposedBreakMins?, swapShiftId?, reason? }`

2. **GET /stores/:storeId/requests**
   - List change requests
   - Query params: `status?`, `type?`, `mine?`

3. **GET /stores/:storeId/requests/:requestId**
   - Get request detail

4. **POST /stores/:storeId/requests/:requestId/approve**
   - Approve request (Manager/Owner only)
   - Body: `{ chosenUserId?, decisionNote? }`

5. **POST /stores/:storeId/requests/:requestId/reject**
   - Reject request (Manager/Owner only)
   - Body: `{ decisionNote? }`

6. **POST /stores/:storeId/requests/:requestId/cancel**
   - Cancel request (creator only, PENDING only)

## Authorization Rules

### Worker
- Can create requests ONLY for their own assigned published shifts
- Can list only their own requests (`mine=true`)
- Can cancel their own PENDING requests
- Cannot approve/reject requests

### Manager/Owner
- Can list all requests in store
- Can approve/reject any PENDING request
- Can view all request details

## Workflow

1. **Worker creates request:**
   - Navigate to `/schedule`
   - Select a published shift assigned to them
   - Click "Request Change" button
   - Fill in proposed time changes
   - Submit request

2. **Manager/Owner reviews:**
   - Navigate to `/requests`
   - View PENDING requests
   - Click "View" to see details
   - Click "Approve" or "Reject"
   - Add optional decision note

3. **Upon approval:**
   - Shift is automatically updated
   - Request status changes to APPROVED
   - Audit log entry created
   - Schedule UI reflects changes

## Error Handling

- **401**: Redirected to login (handled by axios interceptor)
- **403**: Shows "You don't have permission" message
- **409**: Shows "There is already a pending request for this shift"
- **400**: Shows validation error message

## Testing Steps

### 1. Setup
```bash
# Backend
cd /Users/joon/shiftory-api
npm run start:dev

# Frontend
cd /Users/joon/Downloads/staff-scheduling-ui
npm run dev
```

### 2. Create Month and Shifts (as Owner)
1. Login as Owner
2. Navigate to `/schedule`
3. Create a month if needed
4. Add shifts for a Worker user
5. Publish the month

### 3. Create Change Request (as Worker)
1. Login as Worker (the user assigned to the shift)
2. Navigate to `/schedule`
3. Select the published shift
4. Click "Request Change" button
5. Fill in proposed time changes
6. Submit request
7. Verify success message

### 4. Approve Request (as Owner/Manager)
1. Login as Owner or Manager
2. Navigate to `/requests`
3. View PENDING requests
4. Click "View" on the request
5. Click "Approve"
6. Add optional decision note
7. Confirm approval
8. Verify shift time is updated in `/schedule`

### 5. Verify Changes
1. Navigate to `/schedule`
2. Select the date with the approved shift
3. Verify shift time matches the approved request

## Files Changed/Created

### Backend (Already Exists)
- `src/change-requests/change-requests.module.ts`
- `src/change-requests/change-requests.service.ts`
- `src/change-requests/change-requests.controller.ts`
- `src/change-requests/audit.service.ts`
- `src/change-requests/dto/*.dto.ts`
- `prisma/schema.prisma` (ChangeRequest, ChangeRequestCandidate, AuditLog models)

### Frontend (New)
- `types/requests.ts`
- `lib/requestsApi.ts`
- `app/requests/page.tsx`
- `components/modals/request-change-modal.tsx`

### Frontend (Modified)
- `app/schedule/page.tsx` - Added Request Change button

## Notes

- The backend implementation is complete and tested
- The frontend implements SHIFT_TIME_CHANGE requests only (MVP)
- Other request types (DROP, COVER, SWAP) can be added later
- The sidebar already has a "Requests" link
- Workers can only see their own requests
- Managers/Owners see all requests

