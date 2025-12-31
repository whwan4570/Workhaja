import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

/**
 * DTO for creating a document
 */
export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetUserIds?: string[]; // If not provided or empty, can mean "ALL" or handle in service
}

