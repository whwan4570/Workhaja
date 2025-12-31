import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for applying as a cover candidate
 */
export class ApplyCandidateDto {
  @IsOptional()
  @IsString()
  note?: string;
}
