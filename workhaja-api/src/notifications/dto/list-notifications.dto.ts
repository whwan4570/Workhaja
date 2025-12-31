import { IsOptional, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListNotificationsDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unread?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}

