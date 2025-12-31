import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for rejecting a change request
 */
export class RejectChangeRequestDto {
  @IsOptional()
  @IsString()
  decisionNote?: string;
}
