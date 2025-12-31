import { IsBoolean, IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * DTO for updating labor rules
 */
export class UpdateLaborRulesDto {
  @IsOptional()
  @IsBoolean()
  overtimeDailyEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  overtimeDailyMinutes?: number;

  @IsOptional()
  @IsBoolean()
  overtimeWeeklyEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  overtimeWeeklyMinutes?: number;

  @IsOptional()
  @IsBoolean()
  breakPaid?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  weekStartsOn?: number; // 0=Sun, 1=Mon, ..., 6=Sat
}

