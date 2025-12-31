import { IsInt, Min, Max, IsOptional, IsISO8601 } from 'class-validator';

/**
 * DTO for creating a new schedule month
 */
export class CreateMonthDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsOptional()
  @IsISO8601()
  lockAt?: string;
}
