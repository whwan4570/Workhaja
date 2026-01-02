import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO for updating a store
 */
export class UpdateStoreDto {
  @IsString()
  @MinLength(1, { message: 'Store name is required' })
  @MaxLength(100, { message: 'Store name must not exceed 100 characters' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @MinLength(4, { message: 'Special code must be at least 4 characters' })
  @MaxLength(20, { message: 'Special code must not exceed 20 characters' })
  @IsOptional()
  specialCode?: string;
}

