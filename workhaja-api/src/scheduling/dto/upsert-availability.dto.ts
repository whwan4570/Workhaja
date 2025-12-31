import {
  IsString,
  IsISO8601,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO for creating or updating availability
 */
export class UpsertAvailabilityDto {
  @IsISO8601()
  date: string; // YYYY-MM-DD format

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string; // HH:mm format (nullable for full day unavailable)

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string; // HH:mm format (nullable for full day unavailable)
}
