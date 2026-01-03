import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { TimeEntryType } from '@prisma/client';

/**
 * DTO for check-in/check-out using TOTP token from QR code
 */
export class CheckinWithTotpDto {
  @IsString()
  @MinLength(6, { message: 'TOTP token must be 6 digits' })
  @MaxLength(6, { message: 'TOTP token must be 6 digits' })
  token: string;

  @IsEnum(TimeEntryType, { message: 'Type must be CHECK_IN or CHECK_OUT' })
  type: TimeEntryType;
}
