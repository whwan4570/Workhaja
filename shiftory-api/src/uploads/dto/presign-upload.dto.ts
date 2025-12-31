import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum UploadPurpose {
  DOCUMENT = 'DOCUMENT',
  SUBMISSION = 'SUBMISSION',
}

export class PresignUploadDto {
  @IsEnum(UploadPurpose)
  @IsNotEmpty()
  purpose: UploadPurpose;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}

