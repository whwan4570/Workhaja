# Migration Guide - Stage 2: Stores and Memberships

## Prerequisites

1. Ensure PostgreSQL is running
2. Ensure `.env` file has `DATABASE_URL` configured
3. Backup your database if needed

## Migration Steps

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Create and Apply Migration

```bash
npx prisma migrate dev --name add_stores_and_memberships
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate the Prisma Client with new models

### 3. Verify Migration

```bash
# Check migration status
npx prisma migrate status

# Open Prisma Studio to verify tables
npx prisma studio
```

You should see:
- `stores` table
- `memberships` table
- Updated `users` table with `memberships` relation

## Rollback (if needed)

If you need to rollback the migration:

```bash
npx prisma migrate reset
```

**Warning**: This will drop all data. Use with caution.

## Schema Changes Summary

### New Models

1. **Store**
   - `id` (String, cuid)
   - `name` (String)
   - `timezone` (String, default: "America/New_York")
   - `createdAt`, `updatedAt` (DateTime)

2. **Membership**
   - `id` (String, cuid)
   - `userId` (String, foreign key to User)
   - `storeId` (String, foreign key to Store)
   - `role` (Role enum: OWNER, MANAGER, WORKER)
   - `createdAt`, `updatedAt` (DateTime)
   - Unique constraint: `[userId, storeId]`
   - Index: `[storeId, role]`

### Updated Models

1. **User**
   - Added `memberships` relation to Membership[]

### Enums

- **Role**: OWNER, MANAGER, WORKER (already existed, now used)

