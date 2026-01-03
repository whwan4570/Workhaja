import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TimeEntryStatus } from '@prisma/client';

/**
 * DTO for reviewing (approving/rejecting) a time entry
 */
export class ReviewTimeEntryDto {
  @IsEnum(TimeEntryStatus, {
    message: 'Status must be APPROVED or REJECTED',
  })
  status: TimeEntryStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string; // Optional note from reviewer
}

