import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Uses passport-jwt strategy to validate Bearer tokens.
 * Apply to routes that require authenticated users.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
