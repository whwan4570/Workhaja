import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadPurpose } from './dto/presign-upload.dto';

// Simple ID generator (can be replaced with cuid if needed)
function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'auto';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET || '';
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || '';

    // Only initialize S3 client if configuration is provided
    if (accessKeyId && secretAccessKey && this.bucket) {
      this.s3Client = new S3Client({
        endpoint,
        region: region === 'auto' ? undefined : region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: endpoint ? true : false, // For R2 and other S3-compatible services
      });
    }
  }

  /**
   * Generate presigned URL for file upload
   */
  async generatePresignedUrl(
    storeId: string,
    purpose: UploadPurpose,
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; method: string }> {
    // Check if S3 is configured
    if (!this.s3Client || !this.bucket) {
      throw new BadRequestException(
        'File upload is not configured. Please set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET environment variables.',
      );
    }

    // Sanitize filename
    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255);

    // Generate unique file ID
    const fileId = generateFileId();

    // Build file path: /stores/{storeId}/{purpose}/{yyyy}/{mm}/{cuid}-{filename}
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const filePath = `stores/${storeId}/${purpose}/${year}/${month}/${fileId}-${sanitizedFilename}`;

    // Generate presigned PUT URL (expires in 10 minutes)
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 600, // 10 minutes
    });

    // Build public file URL
    const fileUrl = this.publicBaseUrl
      ? `${this.publicBaseUrl}/${filePath}`
      : uploadUrl.split('?')[0]; // Fallback to S3 URL without query params

    return {
      uploadUrl,
      fileUrl,
      method: 'PUT',
    };
  }
}

