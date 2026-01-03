import { IsInt, Min, Max } from 'class-validator';

/**
 * DTO for copying shifts from one month to another
 */
export class CopyMonthDto {
  @IsInt()
  @Min(1)
  @Max(12)
  fromMonth: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  fromYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  toMonth: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  toYear: number;
}
