import {
  IsEnum,
  IsString,
  IsISO8601,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

/**
 * DTO for submitting a document submission
 */
export class SubmitSubmissionDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsISO8601()
  issuedAt?: string;

  @ValidateIf((o) =>
    o.type === 'HEALTH_CERT' || o.type === 'HYGIENE_TRAINING',
  )
  @IsISO8601()
  expiresAt?: string; // Required for HEALTH_CERT and HYGIENE_TRAINING
}

