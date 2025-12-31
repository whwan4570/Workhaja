# Environment Variables

## Required for Notifications

```env
INTERNAL_KEY=your-secret-key-here
```

Used for admin debug endpoints (`/stores/:storeId/admin/notifications/*`).

## Required for Uploads (S3/R2)

```env
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

### Cloudflare R2 Setup

1. Create R2 bucket in Cloudflare dashboard
2. Create API token with read/write permissions
3. Set `S3_ENDPOINT` to your R2 endpoint (found in R2 dashboard)
4. Set `S3_REGION` to `auto` (or leave empty)
5. Set `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` from API token
6. Set `S3_BUCKET` to your bucket name
7. (Optional) Set `S3_PUBLIC_BASE_URL` if using custom domain for public access

### AWS S3 Setup

If using AWS S3 instead of R2:

```env
S3_ENDPOINT=  # Leave empty for AWS S3
S3_REGION=us-east-1  # Your AWS region
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.s3.amazonaws.com
```

## Complete .env Example

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shiftory?schema=public"

# JWT
JWT_SECRET=your-jwt-secret-key

# Server
PORT=3000

# Notifications
INTERNAL_KEY=your-internal-key-for-admin-endpoints

# S3/R2 Uploads
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

