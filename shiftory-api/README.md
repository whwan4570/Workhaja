# Shiftory API

A NestJS-based backend API for shift management with JWT authentication and role-based access control.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (passport-jwt)
- **Password Hashing**: bcrypt

## Project Structure

```
shiftory-api/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── admin/                # Admin module (role-protected endpoints)
│   │   ├── admin.controller.ts
│   │   └── admin.module.ts
│   ├── auth/                 # Authentication module
│   │   ├── decorators/       # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/           # Route guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/       # Passport strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── common/               # Shared code
│   │   └── enums/
│   │       └── role.enum.ts
│   ├── prisma/               # Database module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/                # Users module
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env                      # Environment variables (not in git)
├── .env.example              # Example environment file
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Install dependencies

```bash
cd shiftory-api
npm install
```

### 2. Configure environment

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shiftory?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

### 3. Create database

```bash
# Create PostgreSQL database
createdb shiftory

# Or using psql
psql -U postgres -c "CREATE DATABASE shiftory;"
```

### 4. Run Prisma migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 5. Start the server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes (JWT) |

### Admin (Role-Protected)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/admin/ping` | Test OWNER access | OWNER |
| GET | `/admin/manager-ping` | Test MANAGER access | OWNER, MANAGER |

## Testing with cURL

### 1. Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get current user info (Protected)

```bash
# Replace <TOKEN> with the accessToken from login/register
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response:**
```json
{
  "id": "clxxxxxxxxxxxxxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Test role-protected endpoint (Expected to fail in Stage 1)

```bash
curl -X GET http://localhost:3000/admin/ping \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Access denied: User has no role assigned. Role assignment via Membership will be available in a future update.",
  "error": "Forbidden"
}
```

> **Note:** This 403 response is expected! In Stage 1, users don't have roles assigned yet. The Membership model (which links Users to Stores with Roles) will be implemented in a future stage.

### 5. Test without authentication

```bash
curl -X GET http://localhost:3000/auth/me
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Common Errors and Solutions

### 1. `Error: P1001: Can't reach database server`

**Cause:** PostgreSQL is not running or connection string is incorrect.

**Solutions:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### 2. `Error: JWT_SECRET is not defined`

**Cause:** Environment variables are not loaded properly.

**Solutions:**
```bash
# Ensure .env file exists
ls -la .env

# Check .env content
cat .env

# Make sure JWT_SECRET is set
echo "JWT_SECRET=your-secret-key" >> .env
```

### 3. `Error: Cannot find module '@prisma/client'`

**Cause:** Prisma Client has not been generated.

**Solutions:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Or directly
npx prisma generate
```

### 4. `BadRequestException: Email already registered`

**Cause:** Attempting to register with an email that already exists.

**Solutions:**
- Use a different email address
- Delete the existing user from database
- Use the login endpoint instead

### 5. `UnauthorizedException: Invalid email or password`

**Cause:** Login credentials don't match any user.

**Solutions:**
- Verify email is correct
- Verify password is correct
- Register a new account if needed

## Development Scripts

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio
```

## Overtime Calculation Policy

The system uses a **MAX_DAILY_OR_WEEKLY** policy for overtime calculation:

- **Daily Overtime**: If `overtimeDailyEnabled` is true, any day with paid work minutes exceeding `overtimeDailyMinutes` counts as daily overtime.
- **Weekly Overtime**: If `overtimeWeeklyEnabled` is true, any week with total paid work minutes exceeding `overtimeWeeklyMinutes` counts as weekly overtime.
- **Final Overtime**: The system takes the **maximum** of:
  - Sum of all daily overtimes in the period
  - Maximum weekly overtime in the period

This ensures that workers are compensated for the higher of daily or weekly overtime, preventing double-counting while ensuring fair compensation.

Example:
- Daily overtime sum: 300 minutes
- Weekly overtime max: 500 minutes
- Final overtime: 500 minutes (the maximum)

## Future Stages

This is Stage 1 implementation. Future stages will include:

- **Stage 2:** Store model and Membership (User-Store relationship with roles)
- **Stage 3:** Shift scheduling and management
- **Stage 4:** Change requests workflow
- **Stage 5:** Time & Labor Rules (completed)

## License

MIT
