import { IsString, IsOptional, ValidateIf } from 'class-validator';

/**
 * DTO for approving a change request
 */
export class ApproveChangeRequestDto {
  @IsOptional()
  @IsString()
  decisionNote?: string;

  // COVER_REQUEST field
  @ValidateIf((o, value) => {
    // This will be validated in service based on request type
    return true;
  })
  @IsOptional()
  @IsString()
  chosenUserId?: string;
}
