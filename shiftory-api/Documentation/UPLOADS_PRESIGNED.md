# Presigned Uploads Implementation

## Overview
S3-compatible presigned URL uploads for secure file uploads without exposing credentials.

## Architecture

### Flow
1. Client requests presigned URL from backend
2. Backend generates presigned PUT URL (expires in 10 minutes)
3. Client uploads file directly to S3/R2 using presigned URL
4. Backend returns public file URL for storage

## Endpoint

### Presign Upload
- `POST /stores/:storeId/uploads/presign`
- Body: `{ purpose: "DOCUMENT" | "SUBMISSION", filename: string, contentType: string }`
- Response: `{ uploadUrl: string, fileUrl: string, method: "PUT" }`

## File Path Structure
```
stores/{storeId}/{purpose}/{yyyy}/{mm}/{cuid}-{sanitizedFilename}
```

Example:
```
stores/store123/DOCUMENT/2024/12/clx123abc-contract.pdf
```

## Environment Variables

```env
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_PUBLIC_BASE_URL=https://your-bucket.public-url.com
```

## Cloudflare R2 Setup

1. Create R2 bucket
2. Get API token with read/write permissions
3. Set `S3_ENDPOINT` to your R2 endpoint
4. Set `S3_PUBLIC_BASE_URL` to your public domain (if using custom domain)

## Security

- Presigned URLs expire in 10 minutes
- Only authenticated store members can request presigned URLs
- File paths are scoped to store and purpose
- Filenames are sanitized to prevent path traversal

## Usage

### Backend
```typescript
const result = await uploadsService.generatePresignedUrl(
  storeId,
  UploadPurpose.DOCUMENT,
  'contract.pdf',
  'application/pdf'
);
// Returns: { uploadUrl, fileUrl, method: 'PUT' }
```

### Frontend
```typescript
// 1. Get presigned URL
const { uploadUrl, fileUrl } = await presignUpload(storeId, {
  purpose: 'DOCUMENT',
  filename: file.name,
  contentType: file.type
});

// 2. Upload file
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Use fileUrl in your document/submission
```

