import {
  IsString,
  IsISO8601,
  Matches,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';

/**
 * DTO for updating a shift
 */
export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsISO8601()
  date?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string; // HH:mm format

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string; // HH:mm format

  @IsOptional()
  @IsInt()
  @Min(0)
  breakMins?: number;
}
