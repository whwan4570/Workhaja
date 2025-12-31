import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for reviewing (approving/rejecting) a submission
 */
export class ReviewSubmissionDto {
  @IsOptional()
  @IsString()
  decisionNote?: string;
}

