import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * User data returned without sensitive fields
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UsersService handles all user-related database operations.
 */
@Injectable()
export class UsersService {
  // Number of salt rounds for bcrypt hashing
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user with hashed password
   * @param email - User's email address (must be unique)
   * @param password - Plain text password (will be hashed)
   * @param name - User's display name
   * @returns Created user without password hash
   * @throws BadRequestException if email already exists
   */
  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<SafeUser> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create the user in database
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Return user without password hash
    return this.excludePassword(user);
  }

  /**
   * Find a user by email address
   * @param email - Email to search for
   * @returns User with password hash (for authentication) or null
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by ID
   * @param id - User ID to search for
   * @returns User without password hash or null
   */
  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.excludePassword(user);
  }

  /**
   * Validate user password
   * @param plainPassword - Plain text password to validate
   * @param hashedPassword - Hashed password from database
   * @returns True if password matches, false otherwise
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Helper to exclude password hash from user object
   */
  private excludePassword(user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
