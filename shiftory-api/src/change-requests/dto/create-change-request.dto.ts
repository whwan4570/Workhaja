import {
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ChangeRequestType } from '@prisma/client';

/**
 * DTO for creating a change request
 */
export class CreateChangeRequestDto {
  @IsEnum(ChangeRequestType)
  type: ChangeRequestType;

  @IsString()
  shiftId: string;

  @IsOptional()
  @IsString()
  reason?: string;

  // TIME_CHANGE fields
  @ValidateIf((o) => o.type === 'SHIFT_TIME_CHANGE')
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'proposedStartTime must be in HH:mm format',
  })
  proposedStartTime?: string;

  @ValidateIf((o) => o.type === 'SHIFT_TIME_CHANGE')
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'proposedEndTime must be in HH:mm format',
  })
  proposedEndTime?: string;

  @ValidateIf((o) => o.type === 'SHIFT_TIME_CHANGE')
  @IsOptional()
  @IsInt()
  @Min(0)
  proposedBreakMins?: number;

  // SWAP_REQUEST field
  @ValidateIf((o) => o.type === 'SHIFT_SWAP_REQUEST')
  @IsString()
  swapShiftId?: string;
}
