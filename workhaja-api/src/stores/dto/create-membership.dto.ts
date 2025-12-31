import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

/**
 * DTO for creating a new membership
 */
export class CreateMembershipDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsEnum(Role, { message: 'Role must be OWNER, MANAGER, or WORKER' })
  role: Role;
}

