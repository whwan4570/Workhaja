# Test Scenarios - Stage 2: Stores and Memberships

## Prerequisites

1. Server is running: `npm run start:dev`
2. Migration has been applied: `npx prisma migrate dev`
3. Base URL: `http://localhost:3000`

## Test Scenario: Complete Flow

### Step 1: Register User A

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userA@test.com",
    "password": "Passw0rd!",
    "name": "User A"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "storeId": "clx1234567890abcdef"
}
```

**Save the values:**
```bash
export TOKEN_A="<accessToken from response>"
export STORE_ID_A="<storeId from response>"
```

### Step 2: User A checks their stores

```bash
curl http://localhost:3000/stores \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:**
```json
[
  {
    "id": "clx1234567890abcdef",
    "name": "User A's Store",
    "timezone": "America/New_York",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "role": "OWNER"
  }
]
```

### Step 3: Register User B

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userB@test.com",
    "password": "Passw0rd!",
    "name": "User B"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "storeId": "clx9876543210fedcba"
}
```

**Save the values:**
```bash
export TOKEN_B="<accessToken from response>"
export STORE_ID_B="<storeId from response>"
```

### Step 4: User A adds User B as WORKER to Store A

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userB@test.com",
    "role": "WORKER"
  }'
```

**Expected Response:**
```json
{
  "id": "clxabcdef1234567890",
  "userId": "<userB's id>",
  "storeId": "clx1234567890abcdef",
  "role": "WORKER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "<userB's id>",
    "email": "userB@test.com",
    "name": "User B"
  }
}
```

### Step 5: User B checks their role in Store A

```bash
curl http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:**
```json
{
  "id": "clxabcdef1234567890",
  "userId": "<userB's id>",
  "storeId": "clx1234567890abcdef",
  "role": "WORKER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "<userB's id>",
    "email": "userB@test.com",
    "name": "User B"
  }
}
```

### Step 6: User A (OWNER) accesses admin ping

```bash
curl http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200
```json
{
  "message": "pong",
  "user": {
    "id": "<userA's id>",
    "email": "userA@test.com",
    "role": "OWNER"
  },
  "storeId": "clx1234567890abcdef",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 7: User B (WORKER) tries to access admin ping

```bash
curl http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied: Required role(s): OWNER",
  "error": "Forbidden"
}
```

## Additional Test Cases

### Test Case 1: Duplicate Membership

```bash
# Try to add User B again (should fail)
curl -X POST http://localhost:3000/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userB@test.com",
    "role": "MANAGER"
  }'
```

**Expected Response:** HTTP 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "User is already a member of this store",
  "error": "Bad Request"
}
```

### Test Case 2: Non-existent User

```bash
# Try to add a user that doesn't exist
curl -X POST http://localhost:3000/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@test.com",
    "role": "WORKER"
  }'
```

**Expected Response:** HTTP 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### Test Case 3: WORKER tries to add member

```bash
# User B (WORKER) tries to add a member (should fail)
curl -X POST http://localhost:3000/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userC@test.com",
    "role": "WORKER"
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER and MANAGER can add members to the store",
  "error": "Forbidden"
}
```

### Test Case 4: Access store membership without being a member

```bash
# User B tries to access Store B's membership (they're not a member)
curl http://localhost:3000/stores/$STORE_ID_B/me \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 403 Forbidden (from StoreContextInterceptor)
```json
{
  "statusCode": 403,
  "message": "Access denied: You are not a member of this store",
  "error": "Forbidden"
}
```

### Test Case 5: Create additional store

```bash
# User A creates another store
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User A Second Store",
    "timezone": "Asia/Seoul"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxnewstore123456",
  "name": "User A Second Store",
  "timezone": "Asia/Seoul",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

User A should now have 2 stores when calling `GET /stores`.

## Quick Test Script

Save this as `test-stage2.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Step 1: Register User A ==="
RESPONSE_A=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@test.com","password":"Passw0rd!","name":"User A"}')
TOKEN_A=$(echo $RESPONSE_A | jq -r '.accessToken')
STORE_ID_A=$(echo $RESPONSE_A | jq -r '.storeId')
echo "Token A: $TOKEN_A"
echo "Store ID A: $STORE_ID_A"

echo -e "\n=== Step 2: User A checks stores ==="
curl -s http://localhost:3000/stores -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 3: Register User B ==="
RESPONSE_B=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","password":"Passw0rd!","name":"User B"}')
TOKEN_B=$(echo $RESPONSE_B | jq -r '.accessToken')
STORE_ID_B=$(echo $RESPONSE_B | jq -r '.storeId')
echo "Token B: $TOKEN_B"
echo "Store ID B: $STORE_ID_B"

echo -e "\n=== Step 4: User A adds User B as WORKER ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/memberships \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@test.com","role":"WORKER"}' | jq '.'

echo -e "\n=== Step 5: User B checks role in Store A ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 6: User A (OWNER) accesses admin ping ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 7: User B (WORKER) tries admin ping (should fail) ==="
curl -s http://localhost:3000/stores/$STORE_ID_A/admin/ping \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'
```

Make it executable and run:
```bash
chmod +x test-stage2.sh
./test-stage2.sh
```

---

# Test Scenarios - Stage 3: Scheduling MVP Core

## Prerequisites

1. Server is running: `npm run start:dev`
2. Stage 2 migration has been applied
3. **Stage 3 migration must be applied:** `npx prisma migrate dev`
4. Base URL: `http://localhost:3000`
5. User A (OWNER) and User B (WORKER) are already set up with Store A (from Stage 2)

**Note:** Before running Stage 3 tests, ensure you have:
- `TOKEN_A` (User A's token, OWNER)
- `TOKEN_B` (User B's token, WORKER)
- `STORE_ID_A` (Store ID where A is OWNER and B is WORKER)

## Test Scenario: Complete Scheduling Flow

### Step 1: A (OWNER) creates a schedule month for 2026-01

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 1,
    "lockAt": "2026-01-15T23:59:59Z"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxmonth1234567890",
  "storeId": "<STORE_ID_A>",
  "year": 2026,
  "month": 1,
  "status": "OPEN",
  "lockAt": "2026-01-15T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Save the values:**
```bash
export MONTH_YEAR=2026
export MONTH_MONTH=1
```

### Step 2: B (WORKER) submits availability for 2026-01

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/availability \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-05",
    "startTime": "09:00",
    "endTime": "17:00"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxavail1234567890",
  "storeId": "<STORE_ID_A>",
  "userId": "<userB's id>",
  "monthId": "clxmonth1234567890",
  "date": "2026-01-05T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "type": "UNAVAILABLE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "<userB's id>",
    "email": "userB@test.com",
    "name": "User B"
  }
}
```

### Step 3: A (OWNER) creates a shift for B (WORKER)

First, get User B's ID from Step 2 response or from membership:
```bash
# Get User B's ID
USER_B_ID=$(curl -s http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq -r '.userId')
```

Then create shift:
```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/shifts \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_B_ID'",
    "date": "2026-01-10",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakMins": 60
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxshift1234567890",
  "storeId": "<STORE_ID_A>",
  "monthId": "clxmonth1234567890",
  "userId": "<userB's id>",
  "date": "2026-01-10T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakMins": 60,
  "status": "DRAFT",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "<userB's id>",
    "email": "userB@test.com",
    "name": "User B"
  }
}
```

**Save the shift ID:**
```bash
export SHIFT_ID="<shift id from response>"
```

### Step 4: B (WORKER) views their shifts (date range)

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-07" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
[]
```

(No shifts in this range, shift was created for 2026-01-10)

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
[
  {
    "id": "clxshift1234567890",
    "storeId": "<STORE_ID_A>",
    "monthId": "clxmonth1234567890",
    "userId": "<userB's id>",
    "date": "2026-01-10T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakMins": 60,
    "status": "DRAFT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "<userB's id>",
      "email": "userB@test.com",
      "name": "User B"
    },
    "month": {
      "id": "clxmonth1234567890",
      "year": 2026,
      "month": 1,
      "status": "OPEN"
    }
  }
]
```

### Step 5: A (OWNER) publishes the month

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/publish \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "clxmonth1234567890",
  "storeId": "<STORE_ID_A>",
  "year": 2026,
  "month": 1,
  "status": "PUBLISHED",
  "lockAt": "2026-01-15T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Step 6: A (OWNER) tries to update shift after publish (should fail)

```bash
curl -X PUT http://localhost:3000/stores/$STORE_ID_A/shifts/$SHIFT_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "10:00"
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Cannot update shifts in a published schedule month",
  "error": "Forbidden"
}
```

### Step 7: B (WORKER) tries to view another user's shifts (should fail)

First, get User A's ID:
```bash
USER_A_ID=$(curl -s http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_A" | jq -r '.userId')
```

Then try to view User A's shifts as User B:
```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31&userId=$USER_A_ID" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Workers can only view their own shifts",
  "error": "Forbidden"
}
```

## Additional Test Cases

### Test Case 1: Duplicate Month Creation

```bash
# Try to create the same month again (should fail)
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 1
  }'
```

**Expected Response:** HTTP 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Schedule month for 2026-01 already exists",
  "error": "Conflict"
}
```

### Test Case 2: WORKER tries to create month (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2026,
    "month": 2
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER and MANAGER can create schedule months",
  "error": "Forbidden"
}
```

### Test Case 3: WORKER tries to create shift (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/2026-02/shifts \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_B_ID'",
    "date": "2026-02-01",
    "startTime": "09:00",
    "endTime": "17:00"
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER and MANAGER can create shifts",
  "error": "Forbidden"
}
```

### Test Case 4: WORKER tries to publish month (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/2026-02/publish \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER can publish schedule months",
  "error": "Forbidden"
}
```

### Test Case 5: Get month with shifts and availability

```bash
curl http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "clxmonth1234567890",
  "storeId": "<STORE_ID_A>",
  "year": 2026,
  "month": 1,
  "status": "PUBLISHED",
  "lockAt": "2026-01-15T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "shifts": [
    {
      "id": "clxshift1234567890",
      "storeId": "<STORE_ID_A>",
      "monthId": "clxmonth1234567890",
      "userId": "<userB's id>",
      "date": "2026-01-10T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "breakMins": 60,
      "status": "PUBLISHED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "<userB's id>",
        "email": "userB@test.com",
        "name": "User B"
      }
    }
  ],
  "availabilities": [
    {
      "id": "clxavail1234567890",
      "storeId": "<STORE_ID_A>",
      "userId": "<userB's id>",
      "monthId": "clxmonth1234567890",
      "date": "2026-01-05T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "type": "UNAVAILABLE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "<userB's id>",
        "email": "userB@test.com",
        "name": "User B"
      }
    }
  ]
}
```

### Test Case 6: Availability modification after publish (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/availability \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-06",
    "startTime": "10:00",
    "endTime": "18:00"
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Cannot modify availability for a published schedule month",
  "error": "Forbidden"
}
```

### Test Case 7: List availability (WORKER sees only own, MANAGER/OWNER sees all)

As WORKER (B):
```bash
curl http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/availability \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** Only User B's availability

As OWNER (A):
```bash
curl http://localhost:3000/stores/$STORE_ID_A/months/$MONTH_YEAR-$MONTH_MONTH/availability \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** All availability in the month

## Quick Test Script

Save this as `test-stage3.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Ensure you have TOKEN_A, TOKEN_B, and STORE_ID_A set from Stage 2
if [ -z "$TOKEN_A" ] || [ -z "$TOKEN_B" ] || [ -z "$STORE_ID_A" ]; then
  echo "Error: TOKEN_A, TOKEN_B, and STORE_ID_A must be set from Stage 2"
  exit 1
fi

echo "=== Step 1: A (OWNER) creates month 2026-01 ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/months \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"month":1,"lockAt":"2026-01-15T23:59:59Z"}' | jq '.'

echo -e "\n=== Step 2: B (WORKER) submits availability ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/months/2026-1/availability \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-01-05","startTime":"09:00","endTime":"17:00"}' | jq '.'

echo -e "\n=== Step 3: Get User B ID ==="
USER_B_ID=$(curl -s $BASE_URL/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq -r '.userId')
echo "User B ID: $USER_B_ID"

echo -e "\n=== Step 4: A (OWNER) creates shift for B ==="
SHIFT_RESPONSE=$(curl -s -X POST $BASE_URL/stores/$STORE_ID_A/months/2026-1/shifts \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_B_ID\",\"date\":\"2026-01-10\",\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"breakMins\":60}")
echo "$SHIFT_RESPONSE" | jq '.'
SHIFT_ID=$(echo "$SHIFT_RESPONSE" | jq -r '.id')

echo -e "\n=== Step 5: B (WORKER) views their shifts ==="
curl -s "$BASE_URL/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 6: A (OWNER) publishes month ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/months/2026-1/publish \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 7: A (OWNER) tries to update shift (should fail) ==="
curl -s -X PUT $BASE_URL/stores/$STORE_ID_A/shifts/$SHIFT_ID \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"startTime":"10:00"}' | jq '.'

echo -e "\n=== Step 8: B (WORKER) tries to view A's shifts (should fail) ==="
USER_A_ID=$(curl -s $BASE_URL/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_A" | jq -r '.userId')
curl -s "$BASE_URL/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31&userId=$USER_A_ID" \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'
```

Make it executable and run:
```bash
chmod +x test-stage3.sh
./test-stage3.sh
```

---

# Test Scenarios - Stage 4: Change Requests Workflow

## Prerequisites

1. Server is running: `npm run start:dev`
2. Stage 3 migration has been applied
3. **Stage 4 migration must be applied:** `npx prisma migrate dev`
4. Base URL: `http://localhost:3000`
5. User A (OWNER), User B (WORKER), and optionally User C (WORKER) are set up with Store A
6. A published month with published shifts exists (from Stage 3)

**Note:** Before running Stage 4 tests, ensure you have:
- `TOKEN_A` (User A's token, OWNER)
- `TOKEN_B` (User B's token, WORKER)
- `TOKEN_C` (User C's token, WORKER, optional)
- `STORE_ID_A` (Store ID)
- `SHIFT_ID_B` (User B's published shift ID)
- `SHIFT_ID_C` (User C's published shift ID, optional)

## Test Scenario: Complete Change Request Flow

### Step 1: B (WORKER) creates TIME_CHANGE request

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_TIME_CHANGE",
    "shiftId": "'$SHIFT_ID_B'",
    "proposedStartTime": "10:00",
    "proposedEndTime": "18:00",
    "proposedBreakMins": 60,
    "reason": "Need to start later due to personal appointment"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxrequest1234567890",
  "storeId": "<STORE_ID_A>",
  "type": "SHIFT_TIME_CHANGE",
  "status": "PENDING",
  "shiftId": "<SHIFT_ID_B>",
  "createdById": "<userB's id>",
  "proposedStartTime": "10:00",
  "proposedEndTime": "18:00",
  "proposedBreakMins": 60,
  "reason": "Need to start later due to personal appointment",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "shift": {
    "id": "<SHIFT_ID_B>",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakMins": 60,
    "user": {
      "id": "<userB's id>",
      "email": "userB@test.com",
      "name": "User B"
    }
  },
  "createdBy": {
    "id": "<userB's id>",
    "email": "userB@test.com",
    "name": "User B"
  }
}
```

**Save the request ID:**
```bash
export REQUEST_ID_1="<request id from response>"
```

### Step 2: A (OWNER) views pending requests

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/requests?status=PENDING" \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200 OK
```json
[
  {
    "id": "clxrequest1234567890",
    "type": "SHIFT_TIME_CHANGE",
    "status": "PENDING",
    ...
  }
]
```

### Step 3: A (OWNER) approves the TIME_CHANGE request

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$REQUEST_ID_1/approve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionNote": "Approved - schedule adjusted"
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "request": {
    "id": "clxrequest1234567890",
    "status": "APPROVED",
    "reviewedById": "<userA's id>",
    "reviewedAt": "2024-01-01T00:00:00.000Z",
    "effectiveAt": "2024-01-01T00:00:00.000Z",
    ...
  },
  "shifts": [
    {
      "id": "<SHIFT_ID_B>",
      "startTime": "10:00",
      "endTime": "18:00",
      "breakMins": 60,
      ...
    }
  ]
}
```

### Step 4: Verify shift was updated

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31&userId=$USER_B_ID" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** Shift should show updated times (10:00-18:00)

### Step 5: B (WORKER) creates COVER_REQUEST

First, create another shift for B if needed, then:

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_COVER_REQUEST",
    "shiftId": "'$SHIFT_ID_B'",
    "reason": "Need someone to cover my shift"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxrequest2345678901",
  "type": "SHIFT_COVER_REQUEST",
  "status": "PENDING",
  ...
}
```

**Save the request ID:**
```bash
export COVER_REQUEST_ID="<request id from response>"
```

### Step 6: C (WORKER) applies as candidate

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$COVER_REQUEST_ID/candidates \
  -H "Authorization: Bearer $TOKEN_C" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "I can cover this shift"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxcandidate1234567890",
  "requestId": "<COVER_REQUEST_ID>",
  "userId": "<userC's id>",
  "note": "I can cover this shift",
  "user": {
    "id": "<userC's id>",
    "email": "userC@test.com",
    "name": "User C"
  }
}
```

### Step 7: B (WORKER) views candidates

```bash
curl http://localhost:3000/stores/$STORE_ID_A/requests/$COVER_REQUEST_ID/candidates \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
[
  {
    "id": "clxcandidate1234567890",
    "userId": "<userC's id>",
    "note": "I can cover this shift",
    "user": {
      "id": "<userC's id>",
      "email": "userC@test.com",
      "name": "User C"
    }
  }
]
```

### Step 8: A (OWNER) approves COVER_REQUEST with chosenUserId

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$COVER_REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "chosenUserId": "'$USER_C_ID'",
    "decisionNote": "Approved - User C will cover"
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "request": {
    "status": "APPROVED",
    ...
  },
  "shifts": [
    {
      "id": "<SHIFT_ID_B>",
      "userId": "<userC's id>",
      "user": {
        "id": "<userC's id>",
        "email": "userC@test.com",
        "name": "User C"
      }
    }
  ]
}
```

### Step 9: B (WORKER) creates SWAP_REQUEST

First, ensure B and C both have published shifts, then:

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_SWAP_REQUEST",
    "shiftId": "'$SHIFT_ID_B'",
    "swapShiftId": "'$SHIFT_ID_C'",
    "reason": "Want to swap shifts with User C"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxrequest3456789012",
  "type": "SHIFT_SWAP_REQUEST",
  "status": "PENDING",
  "swapShiftId": "<SHIFT_ID_C>",
  ...
}
```

**Save the request ID:**
```bash
export SWAP_REQUEST_ID="<request id from response>"
```

### Step 10: A (OWNER) approves SWAP_REQUEST

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$SWAP_REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionNote": "Approved swap"
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "request": {
    "status": "APPROVED",
    ...
  },
  "shifts": [
    {
      "id": "<SHIFT_ID_B>",
      "userId": "<userC's id>",
      ...
    },
    {
      "id": "<SHIFT_ID_C>",
      "userId": "<userB's id>",
      ...
    }
  ]
}
```

### Step 11: B (WORKER) creates DROP_REQUEST

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_DROP_REQUEST",
    "shiftId": "'$SHIFT_ID_B'",
    "reason": "Cannot work this shift"
  }'
```

**Expected Response:** HTTP 201 Created
```json
{
  "id": "clxrequest4567890123",
  "type": "SHIFT_DROP_REQUEST",
  "status": "PENDING",
  ...
}
```

**Save the request ID:**
```bash
export DROP_REQUEST_ID="<request id from response>"
```

### Step 12: A (OWNER) approves DROP_REQUEST

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$DROP_REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionNote": "Approved - shift canceled"
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "request": {
    "status": "APPROVED",
    ...
  },
  "shifts": [
    {
      "id": "<SHIFT_ID_B>",
      "isCanceled": true,
      ...
    }
  ]
}
```

### Step 13: Verify canceled shift is filtered out by default

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** Canceled shift should NOT appear in the list

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31&includeCanceled=true" \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** Canceled shift SHOULD appear when includeCanceled=true

## Additional Test Cases

### Test Case 1: Worker tries to create request for another user's shift (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_TIME_CHANGE",
    "shiftId": "'$SHIFT_ID_C'",
    "proposedStartTime": "10:00",
    "proposedEndTime": "18:00"
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Workers can only create change requests for their own shifts",
  "error": "Forbidden"
}
```

### Test Case 2: Create request for non-published shift (should fail)

```bash
# Create a DRAFT shift first, then try to create request
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_TIME_CHANGE",
    "shiftId": "<DRAFT_SHIFT_ID>",
    "proposedStartTime": "10:00",
    "proposedEndTime": "18:00"
  }'
```

**Expected Response:** HTTP 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Change requests can only be created for published shifts",
  "error": "Bad Request"
}
```

### Test Case 3: Duplicate PENDING request (should fail)

```bash
# Try to create another PENDING request for the same shift
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_TIME_CHANGE",
    "shiftId": "'$SHIFT_ID_B'",
    "proposedStartTime": "11:00",
    "proposedEndTime": "19:00"
  }'
```

**Expected Response:** HTTP 409 Conflict
```json
{
  "statusCode": 409,
  "message": "A pending change request already exists for this shift",
  "error": "Conflict"
}
```

### Test Case 4: Worker tries to approve request (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$REQUEST_ID_1/approve \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER and MANAGER can approve change requests",
  "error": "Forbidden"
}
```

### Test Case 5: Cancel a request

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$REQUEST_ID_1/cancel \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "<REQUEST_ID_1>",
  "status": "CANCELED",
  ...
}
```

### Test Case 6: Reject a request

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$REQUEST_ID_1/reject \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "decisionNote": "Cannot approve due to staffing constraints"
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "<REQUEST_ID_1>",
  "status": "REJECTED",
  "reviewedById": "<userA's id>",
  "decisionNote": "Cannot approve due to staffing constraints",
  ...
}
```

### Test Case 7: Request creator applies as candidate (should fail)

```bash
curl -X POST http://localhost:3000/stores/$STORE_ID_A/requests/$COVER_REQUEST_ID/candidates \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "I want to cover my own shift"
  }'
```

**Expected Response:** HTTP 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "You cannot apply as a candidate for your own cover request",
  "error": "Bad Request"
}
```

## Quick Test Script

Save this as `test-stage4.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Ensure you have TOKEN_A, TOKEN_B, TOKEN_C, STORE_ID_A, SHIFT_ID_B, SHIFT_ID_C set
if [ -z "$TOKEN_A" ] || [ -z "$TOKEN_B" ] || [ -z "$STORE_ID_A" ] || [ -z "$SHIFT_ID_B" ]; then
  echo "Error: TOKEN_A, TOKEN_B, STORE_ID_A, and SHIFT_ID_B must be set"
  exit 1
fi

echo "=== Step 1: B (WORKER) creates TIME_CHANGE request ==="
REQUEST_RESPONSE=$(curl -s -X POST $BASE_URL/stores/$STORE_ID_A/requests \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"SHIFT_TIME_CHANGE\",\"shiftId\":\"$SHIFT_ID_B\",\"proposedStartTime\":\"10:00\",\"proposedEndTime\":\"18:00\",\"proposedBreakMins\":60,\"reason\":\"Need to start later\"}")
echo "$REQUEST_RESPONSE" | jq '.'
REQUEST_ID=$(echo "$REQUEST_RESPONSE" | jq -r '.id')

echo -e "\n=== Step 2: A (OWNER) views pending requests ==="
curl -s "$BASE_URL/stores/$STORE_ID_A/requests?status=PENDING" \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 3: A (OWNER) approves TIME_CHANGE request ==="
curl -s -X POST $BASE_URL/stores/$STORE_ID_A/requests/$REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"decisionNote":"Approved"}' | jq '.'

echo -e "\n=== Step 4: Verify shift was updated ==="
USER_B_ID=$(curl -s $BASE_URL/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq -r '.userId')
curl -s "$BASE_URL/stores/$STORE_ID_A/shifts?from=2026-01-01&to=2026-01-31&userId=$USER_B_ID" \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'
```

Make it executable and run:
```bash
chmod +x test-stage4.sh
./test-stage4.sh
```

---

# Test Scenarios - Stage 5: Time & Labor Rules

## Prerequisites

1. Server is running: `npm run start:dev`
2. Stage 4 migration has been applied
3. **Stage 5 migration must be applied:** `npx prisma migrate dev`
4. Base URL: `http://localhost:3000`
5. User A (OWNER), User B (WORKER) are set up with Store A
6. Published shifts exist for 2026-01 (from Stage 3)

**Note:** Before running Stage 5 tests, ensure you have:
- `TOKEN_A` (User A's token, OWNER)
- `TOKEN_B` (User B's token, WORKER)
- `STORE_ID_A` (Store ID)
- Published shifts for User B in 2026-01

## Test Scenario: Complete Time & Labor Rules Flow

### Step 1: A (OWNER) sets labor rules

```bash
curl -X PUT http://localhost:3000/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "overtimeDailyEnabled": true,
    "overtimeDailyMinutes": 480,
    "overtimeWeeklyEnabled": true,
    "overtimeWeeklyMinutes": 2400,
    "breakPaid": false,
    "weekStartsOn": 1
  }'
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "<STORE_ID_A>",
  "overtimeDailyEnabled": true,
  "overtimeDailyMinutes": 480,
  "overtimeWeeklyEnabled": true,
  "overtimeWeeklyMinutes": 2400,
  "breakPaid": false,
  "weekStartsOn": 1
}
```

### Step 2: B (WORKER) views labor rules

```bash
curl http://localhost:3000/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
{
  "id": "<STORE_ID_A>",
  "overtimeDailyEnabled": true,
  "overtimeDailyMinutes": 480,
  "overtimeWeeklyEnabled": true,
  "overtimeWeeklyMinutes": 2400,
  "breakPaid": false,
  "weekStartsOn": 1
}
```

### Step 3: B (WORKER) gets weekly summary

```bash
curl "http://localhost:3000/stores/$STORE_ID_A/me/summary/weekly?from=2026-01-01&to=2026-01-07" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
{
  "storeId": "<STORE_ID_A>",
  "userId": "<userB's id>",
  "range": {
    "from": "2026-01-01",
    "to": "2026-01-07"
  },
  "totalMins": 1800,
  "overtimeMins": 0,
  "breakMinsTotal": 60,
  "paidMins": 1740,
  "byDay": [
    {
      "date": "2026-01-01",
      "totalMins": 480,
      "breakMins": 60,
      "paidMins": 420,
      "overtimeMins": 0
    },
    {
      "date": "2026-01-02",
      "totalMins": 480,
      "breakMins": 0,
      "paidMins": 480,
      "overtimeMins": 0
    },
    ...
  ]
}
```

### Step 4: B (WORKER) gets monthly summary

```bash
curl http://localhost:3000/stores/$STORE_ID_A/me/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 200 OK
```json
{
  "storeId": "<STORE_ID_A>",
  "userId": "<userB's id>",
  "year": 2026,
  "month": 1,
  "totalMins": 7200,
  "overtimeMins": 300,
  "breakMinsTotal": 240,
  "paidMins": 6960
}
```

### Step 5: A (OWNER) gets monthly summary by staff

```bash
curl http://localhost:3000/stores/$STORE_ID_A/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200 OK
```json
{
  "storeId": "<STORE_ID_A>",
  "year": 2026,
  "month": 1,
  "items": [
    {
      "userId": "<userB's id>",
      "name": "User B",
      "email": "userB@test.com",
      "totalMins": 7200,
      "overtimeMins": 300,
      "breakMinsTotal": 240,
      "paidMins": 6960
    },
    ...
  ]
}
```

### Step 6: A (OWNER) gets specific user monthly summary

```bash
USER_B_ID=$(curl -s http://localhost:3000/stores/$STORE_ID_A/me \
  -H "Authorization: Bearer $TOKEN_B" | jq -r '.userId')

curl http://localhost:3000/stores/$STORE_ID_A/users/$USER_B_ID/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_A"
```

**Expected Response:** HTTP 200 OK
```json
{
  "storeId": "<STORE_ID_A>",
  "userId": "<userB's id>",
  "year": 2026,
  "month": 1,
  "totalMins": 7200,
  "overtimeMins": 300,
  "breakMinsTotal": 240,
  "paidMins": 6960
}
```

### Step 7: B (WORKER) tries to access admin summary (should fail)

```bash
curl http://localhost:3000/stores/$STORE_ID_A/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER and MANAGER can view staff summaries",
  "error": "Forbidden"
}
```

## Additional Test Cases

### Test Case 1: Worker tries to update labor rules (should fail)

```bash
curl -X PUT http://localhost:3000/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "overtimeDailyEnabled": false
  }'
```

**Expected Response:** HTTP 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only OWNER can update labor rules",
  "error": "Forbidden"
}
```

### Test Case 2: Invalid weekStartsOn value (should fail)

```bash
curl -X PUT http://localhost:3000/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "weekStartsOn": 7
  }'
```

**Expected Response:** HTTP 400 Bad Request (validation error)

### Test Case 3: Negative overtime minutes (should fail)

```bash
curl -X PUT http://localhost:3000/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "overtimeDailyMinutes": -100
  }'
```

**Expected Response:** HTTP 400 Bad Request (validation error)

### Test Case 4: Summary with canceled shifts excluded

```bash
# Create a shift, then cancel it via DROP_REQUEST
# Then check summary - canceled shift should not appear
curl "http://localhost:3000/stores/$STORE_ID_A/me/summary/weekly?from=2026-01-01&to=2026-01-07" \
  -H "Authorization: Bearer $TOKEN_B"
```

**Expected Response:** Canceled shifts should not be included in calculations

## Quick Test Script

Save this as `test-stage5.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Ensure you have TOKEN_A, TOKEN_B, and STORE_ID_A set
if [ -z "$TOKEN_A" ] || [ -z "$TOKEN_B" ] || [ -z "$STORE_ID_A" ]; then
  echo "Error: TOKEN_A, TOKEN_B, and STORE_ID_A must be set"
  exit 1
fi

echo "=== Step 1: A (OWNER) sets labor rules ==="
curl -s -X PUT $BASE_URL/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"overtimeDailyEnabled":true,"overtimeDailyMinutes":480,"overtimeWeeklyEnabled":true,"overtimeWeeklyMinutes":2400,"breakPaid":false,"weekStartsOn":1}' | jq '.'

echo -e "\n=== Step 2: B (WORKER) views labor rules ==="
curl -s $BASE_URL/stores/$STORE_ID_A/labor-rules \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 3: B (WORKER) gets weekly summary ==="
curl -s "$BASE_URL/stores/$STORE_ID_A/me/summary/weekly?from=2026-01-01&to=2026-01-07" \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 4: B (WORKER) gets monthly summary ==="
curl -s $BASE_URL/stores/$STORE_ID_A/me/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'

echo -e "\n=== Step 5: A (OWNER) gets monthly summary by staff ==="
curl -s $BASE_URL/stores/$STORE_ID_A/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

echo -e "\n=== Step 6: B (WORKER) tries admin summary (should fail) ==="
curl -s $BASE_URL/stores/$STORE_ID_A/summary/monthly/2026-1 \
  -H "Authorization: Bearer $TOKEN_B" | jq '.'
```

Make it executable and run:
```bash
chmod +x test-stage5.sh
./test-stage5.sh
```

