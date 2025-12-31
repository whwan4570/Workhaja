# Implementation Summary - Stage 2: Stores and Memberships

## Overview

This document summarizes the implementation of Stage 2, which adds Store and Membership domains to the shiftory-api project.

## Changes Made

### 1. Prisma Schema Updates

**File:** `prisma/schema.prisma`

- **Store Model**: Added with `id`, `name`, `timezone` (default: "America/New_York"), and timestamps
- **Membership Model**: Added with `id`, `userId`, `storeId`, `role` (Role enum), and timestamps
- **User Model**: Added `memberships` relation
- **Relations**: 
  - User ↔ Membership (one-to-many)
  - Store ↔ Membership (one-to-many)
- **Constraints**:
  - Unique constraint on `[userId, storeId]` in Membership
  - Index on `[storeId, role]` in Membership

### 2. New Modules and Services

#### StoresModule
- **Location**: `src/stores/`
- **Components**:
  - `StoresService`: Handles store and membership operations
  - `StoresController`: Handles HTTP endpoints
  - `StoreContextInterceptor`: Injects storeId and role into request.user

#### DTOs
- `CreateStoreDto`: For creating stores (name, timezone?)
- `CreateMembershipDto`: For adding members (email, role)

### 3. Authentication Updates

**File:** `src/auth/auth.service.ts`

- Updated `register()` method to automatically:
  1. Create a user
  2. Create a store (name: "{name}'s Store")
  3. Create OWNER membership
  4. Return `{ accessToken, storeId }`

**File:** `src/auth/auth.module.ts`

- Added `StoresModule` import

### 4. Request User Interface Updates

**File:** `src/auth/strategies/jwt.strategy.ts`

- Updated `RequestUser` interface to include:
  - `role?: string` - Injected by StoreContextInterceptor
  - `storeId?: string` - Injected by StoreContextInterceptor

### 5. Store Context Interceptor

**File:** `src/stores/interceptors/store-context.interceptor.ts`

- Intercepts requests with `:storeId` parameter
- Looks up membership for user + store
- Injects `storeId` and `role` into `request.user`
- Throws `ForbiddenException` if membership not found

### 6. API Endpoints

#### Stores Endpoints

- `POST /stores` - Create a new store (requires auth)
  - Creator is automatically assigned as OWNER
  - Returns: Store object

- `GET /stores` - Get all stores where user is a member (requires auth)
  - Returns: Array of stores with user's role

- `GET /stores/:storeId/me` - Get user's membership in a store (requires auth)
  - Uses StoreContextInterceptor
  - Returns: Membership with role

- `POST /stores/:storeId/memberships` - Add a member to a store (requires auth + OWNER/MANAGER)
  - Uses StoreContextInterceptor + RolesGuard
  - Body: `{ email, role }`
  - Returns: Created membership

- `GET /stores/:storeId/admin/ping` - Test OWNER role access (requires auth + OWNER)
  - Uses StoreContextInterceptor + RolesGuard
  - Returns: `{ message: 'pong', user, storeId, timestamp }`

### 7. App Module Updates

**File:** `src/app.module.ts`

- Added `StoresModule` to imports

## Architecture Decisions

### Store Context Injection

We chose to use an **Interceptor** rather than a Guard or Middleware because:
- Interceptors run after Guards, allowing JWT authentication first
- Can modify the request object before it reaches the controller
- Clean separation of concerns

### Role-Based Access Control

- `RolesGuard` checks `request.user.role` (injected by StoreContextInterceptor)
- Store-scoped routes require `:storeId` parameter
- Global routes (like `/auth/me`) work without store context

### Transaction Safety

- Store creation and OWNER membership creation use Prisma transactions
- Ensures data consistency

## File Structure

```
src/
├── stores/
│   ├── dto/
│   │   ├── create-store.dto.ts
│   │   └── create-membership.dto.ts
│   ├── interceptors/
│   │   └── store-context.interceptor.ts
│   ├── stores.controller.ts
│   ├── stores.service.ts
│   ├── stores.module.ts
│   └── index.ts
├── auth/
│   ├── auth.service.ts (updated)
│   ├── auth.module.ts (updated)
│   └── strategies/
│       └── jwt.strategy.ts (updated)
└── app.module.ts (updated)

prisma/
└── schema.prisma (updated)
```

## Migration Steps

1. **Generate Prisma Client**: `npx prisma generate`
2. **Create Migration**: `npx prisma migrate dev --name add_stores_and_memberships`
3. **Verify**: `npx prisma migrate status`

## Testing

See `TEST_SCENARIOS.md` for complete test scenarios including:
- User registration with automatic store creation
- Adding members to stores
- Role-based access control
- Error cases (duplicate membership, non-existent user, etc.)

## Next Steps (Future Stages)

The architecture is designed to support:
- Schedule domain (store-scoped)
- Shift management (store-scoped)
- Additional store-scoped features

All store-scoped routes follow the pattern: `/stores/:storeId/...`

