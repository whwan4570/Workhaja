# Step 4 & Step 5 Implementation Summary

## Overview

This document describes the implementation of:
- **Step 4 Expansion**: Full Change Requests workflow including COVER candidates and SWAP
- **Step 5**: Reports UI for weekly and monthly hours and overtime

## Step 4: Change Requests Expansion

### Created/Modified Files

1. **`types/requests.ts`** (Updated)
   - Added `ChangeRequestCandidate` interface
   - Added `swapShift` relation to `ChangeRequest`

2. **`lib/requestsApi.ts`** (Updated)
   - Added `listCandidates()` - List candidates for cover request
   - Added `addCandidate()` - Volunteer as candidate
   - Added `removeCandidate()` - Withdraw from candidate

3. **`app/requests/page.tsx`** (Completely rewritten)
   - Split view: Left table, Right detail panel
   - Type filter (All, TIME_CHANGE, DROP, COVER, SWAP)
   - Status filter (All, PENDING, APPROVED, REJECTED, CANCELED)
   - Detail panel shows type-specific content
   - COVER request: Candidate list with volunteer/withdraw buttons
   - Approval with candidate selection (radio or dropdown fallback)
   - Error handling for 404 candidates endpoint

4. **`components/modals/create-request-modal.tsx`** (New)
   - Unified modal for all request types
   - Tabs for request type selection
   - TIME_CHANGE: Time inputs
   - DROP: Simple confirmation
   - COVER: Simple confirmation
   - SWAP: Shift ID input + helper list of my shifts

5. **`app/schedule/page.tsx`** (Updated)
   - Replaced `RequestChangeModal` with `CreateRequestModal`
   - Added `myShiftsForSwap` state
   - Loads user's shifts for SWAP helper list

### Features

#### Request Creation
- **TIME_CHANGE**: Proposed start/end time + break minutes
- **DROP**: Reason only
- **COVER**: Reason only
- **SWAP**: Swap shift ID + helper list of my shifts in same month

#### Request Management
- **Workers**: Can volunteer to cover (if COVER request is PENDING)
- **Workers**: Can withdraw from covering
- **Managers/Owners**: Can approve with candidate selection for COVER
- **Managers/Owners**: Can approve/reject all types
- **Creators**: Can cancel PENDING requests

#### Candidate Handling
- If candidates endpoint returns 404, shows banner and falls back to member dropdown
- Radio selection for candidates (if available)
- Member dropdown as fallback

## Step 5: Reports UI

### Created Files

1. **`lib/reportsApi.ts`** (New)
   - `getMyWeeklySummary()` - Weekly hours summary
   - `getMyMonthlySummary()` - Monthly hours summary
   - `getStaffMonthlySummary()` - Staff monthly summary (OWNER/MANAGER)
   - `formatMinutes()` - Format minutes as "Xh Ym"
   - `minutesToDecimalHours()` - Convert to decimal hours

2. **`app/reports/page.tsx`** (New)
   - Three tabs: My Weekly, My Monthly, Staff Monthly
   - Week navigation with weekStartsOn support
   - Month navigation
   - Summary cards: Total, Paid, Break, Overtime
   - Daily breakdown table (weekly)
   - Staff table (monthly) with overtime badges

### Features

#### My Weekly
- Week picker (respects weekStartsOn)
- Summary cards: Total, Paid, Break, Overtime
- Daily breakdown table
- Totals row

#### My Monthly
- Month picker
- Summary cards: Total, Paid, Break, Overtime

#### Staff Monthly (OWNER/MANAGER only)
- Month picker
- Table of all employees
- Shows: Name, Total Hours, Paid Hours, Break Total, Overtime
- Overtime highlighted with badge

### API Endpoints Used

#### Reports
- `GET /stores/:storeId/me/summary/weekly?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /stores/:storeId/me/summary/monthly/:year-:month`
- `GET /stores/:storeId/summary/monthly/:year-:month` (OWNER/MANAGER)

#### Requests (Step 4)
- `GET /stores/:storeId/requests?status=&type=&mine=`
- `GET /stores/:storeId/requests/:requestId`
- `POST /stores/:storeId/requests`
- `POST /stores/:storeId/requests/:requestId/approve` (with `chosenUserId` for COVER)
- `POST /stores/:storeId/requests/:requestId/reject`
- `POST /stores/:storeId/requests/:requestId/cancel`
- `POST /stores/:storeId/requests/:requestId/candidates` (volunteer)
- `GET /stores/:storeId/requests/:requestId/candidates`
- `DELETE /stores/:storeId/requests/:requestId/candidates/:candidateId` (withdraw)

## Navigation

- Sidebar already includes "Reports" link (no changes needed)
- All pages accessible and consistent styling

## Error Handling

### Requests
- **403**: Permission error messages
- **409**: "There is already a pending request for this shift"
- **404** (candidates): Shows banner "Candidates feature is not enabled on server" + fallback to member dropdown

### Reports
- **403**: Hides Staff Monthly tab for non-managers
- **400/500**: Shows error message with retry option

## Testing Plan

### Step 4: Change Requests

1. **Create COVER request as Worker**
   - Login as Worker
   - Go to `/schedule`
   - Select a published shift assigned to you
   - Click "Request Change"
   - Select "Cover" tab
   - Add reason (optional)
   - Submit

2. **Volunteer as another Worker**
   - Login as different Worker
   - Go to `/requests`
   - Select the COVER request
   - Click "Volunteer to Cover"
   - Add optional note
   - Verify you appear in candidates list

3. **Approve with chosen candidate as Manager**
   - Login as Manager/Owner
   - Go to `/requests`
   - Select the COVER request
   - View candidates list
   - Select a candidate (radio or dropdown)
   - Click "Approve"
   - Add optional decision note
   - Confirm approval

4. **Verify shift assigned user changes**
   - Go to `/schedule`
   - Find the shift
   - Verify the assigned user is now the chosen candidate

5. **Test SWAP request**
   - Login as Worker
   - Go to `/schedule`
   - Select a published shift
   - Click "Request Change"
   - Select "Swap" tab
   - Use helper list to select another shift OR enter shift ID
   - Submit

### Step 5: Reports

1. **My Weekly**
   - Login as Worker
   - Go to `/reports`
   - Select "My Weekly" tab
   - Navigate weeks with Prev/Next
   - Verify summary cards show correct totals
   - Verify daily breakdown table

2. **My Monthly**
   - Select "My Monthly" tab
   - Navigate months with Prev/Next
   - Verify summary cards

3. **Staff Monthly (Manager/Owner)**
   - Login as Manager/Owner
   - Go to `/reports`
   - Select "Staff Monthly" tab
   - Verify table shows all employees
   - Verify overtime is highlighted
   - Verify totals are correct

4. **Staff Monthly (Worker)**
   - Login as Worker
   - Go to `/reports`
   - Verify "Staff Monthly" tab is NOT visible

## Files Changed/Created

### Step 4
- `types/requests.ts` (updated)
- `lib/requestsApi.ts` (updated)
- `app/requests/page.tsx` (completely rewritten)
- `components/modals/create-request-modal.tsx` (new)
- `app/schedule/page.tsx` (updated)

### Step 5
- `lib/reportsApi.ts` (new)
- `app/reports/page.tsx` (new)

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
- Candidates feature gracefully degrades if endpoint is missing

