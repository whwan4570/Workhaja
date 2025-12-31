import {
  IsString,
  IsOptional,
  IsArray,
  IsString as IsStringArray,
} from 'class-validator';

/**
 * DTO for updating a document
 */
export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsArray()
  @IsStringArray({ each: true })
  targetUserIds?: string[];
}

