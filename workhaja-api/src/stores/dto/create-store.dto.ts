import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO for creating a new store
 */
export class CreateStoreDto {
  @IsString()
  @MinLength(1, { message: 'Store name is required' })
  @MaxLength(100, { message: 'Store name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

