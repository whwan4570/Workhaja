# Notifications Backend Implementation

## Overview
Notifications module with outbox processing pattern for reliable delivery.

## Architecture

### Models
- **Notification**: User-facing notification record
- **NotificationJob**: Outbox job for processing (retry logic)

### Flow
1. Event occurs (request created, month published, etc.)
2. `NotificationsService.enqueueInAppNotification()` creates Notification + NotificationJob
3. `NotificationsProcessor.processPending()` picks up jobs and marks as SENT
4. For IN_APP channel, notification is immediately available

## Endpoints

### User Endpoints (store-scoped)
- `GET /stores/:storeId/me/notifications` - List notifications
- `POST /stores/:storeId/me/notifications/:id/read` - Mark as read
- `POST /stores/:storeId/me/notifications/read-all` - Mark all as read

### Admin Debug Endpoints (store-scoped, requires INTERNAL_KEY)
- `POST /stores/:storeId/admin/notifications/run/process` - Process pending jobs
- `POST /stores/:storeId/admin/notifications/run/doc-expiration` - Trigger doc expiration scan
- `POST /stores/:storeId/admin/notifications/run/availability-deadline` - Trigger availability deadline scan

## Event Triggers

### Change Requests
- **On create**: Notify OWNER/MANAGER
- **On approve**: Notify creator
- **On reject**: Notify creator

### Months
- **On publish**: Notify all store members

### Submissions
- **On approve**: Notify submitter
- **On reject**: Notify submitter

## Outbox Processing

### Retry Logic
- Max attempts: 5
- Backoff: 30s, 2m, 10m, 1h, 6h
- After max attempts: Mark as FAILED

### Processing
- Picks jobs where `status=PENDING` and `runAt <= now`
- For IN_APP: Immediately mark as SENT
- For EMAIL/PUSH: Would implement actual sending here

## Environment Variables

```env
INTERNAL_KEY=your-secret-key-here
```

## Usage

### Enqueue Notification
```typescript
await notificationsService.enqueueInAppNotification({
  storeId,
  userId,
  type: 'CHANGE_REQUEST_CREATED',
  title: 'New Request',
  message: 'A new change request was created',
  data: { requestId, shiftId },
});
```

### Process Pending
```typescript
const processed = await processor.processPending(50);
```

