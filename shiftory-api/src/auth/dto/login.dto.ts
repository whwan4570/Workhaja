import { IsEmail, IsString } from 'class-validator';

/**
 * DTO for user login request
 */
export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password is required' })
  password: string;
}
