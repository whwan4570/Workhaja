# Change Requests Backend - Implementation Status

## Status: ✅ Already Implemented

The Change Requests workflow backend is **fully implemented** and ready to use.

## Module Structure

```
src/change-requests/
├── change-requests.module.ts
├── change-requests.service.ts
├── change-requests.controller.ts
├── audit.service.ts
├── candidates.controller.ts (optional)
├── candidates.service.ts (optional)
└── dto/
    ├── create-change-request.dto.ts
    ├── approve-change-request.dto.ts
    ├── reject-change-request.dto.ts
    └── apply-candidate.dto.ts
```

## Prisma Schema

The following models are already defined:

1. **ChangeRequest**
   - Fields: id, storeId, type, status, shiftId, createdById, reviewedById, etc.
   - Relations: store, shift, createdBy, reviewedBy, candidates

2. **ChangeRequestCandidate**
   - For cover requests (optional feature)

3. **AuditLog**
   - Tracks all changes for audit purposes

## API Endpoints

All endpoints are implemented at `/stores/:storeId/requests`:

1. **POST /** - Create request
2. **GET /** - List requests (with filters)
3. **GET /:requestId** - Get request detail
4. **POST /:requestId/approve** - Approve request
5. **POST /:requestId/reject** - Reject request
6. **POST /:requestId/cancel** - Cancel request

## Authorization

- Uses `StoreContextInterceptor` for role injection
- Uses `RolesGuard` for Manager/Owner endpoints
- Workers can only create requests for their own shifts
- Workers can only view their own requests

## Shifts Query

The `GET /stores/:storeId/shifts` endpoint already:
- Excludes `isCanceled=true` by default
- Supports `includeCanceled=true` query parameter

## Testing

The backend is ready for testing with the frontend implementation.

