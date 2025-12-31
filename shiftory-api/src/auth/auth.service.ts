import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, SafeUser } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
}

/**
 * Authentication response with access token and store ID
 */
export interface AuthResponse {
  accessToken: string;
  storeId?: string; // Store ID created during registration
}

/**
 * AuthService handles authentication logic including registration and login.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * Register a new user, create a store, and return JWT token
   * @param registerDto - Registration data
   * @returns Access token and store ID
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = registerDto;

    // Create user (UsersService handles email uniqueness check)
    const user = await this.usersService.createUser(email, password, name);

    // Create a store for the new user and assign them as OWNER
    const store = await this.storesService.createStore(user.id, {
      name: `${name}'s Store`,
    });

    // Generate and return JWT token with store ID
    return {
      ...this.generateToken(user),
      storeId: store.id,
    };
  }

  /**
   * Authenticate user with email and password
   * @param loginDto - Login credentials
   * @returns Access token
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate and return JWT token
    return this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Get current user information by ID
   * @param userId - User ID from JWT
   * @returns User data without password
   * @throws UnauthorizedException if user not found
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT token for a user
   * @param user - User data
   * @returns Access token response
   */
  private generateToken(user: SafeUser): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
