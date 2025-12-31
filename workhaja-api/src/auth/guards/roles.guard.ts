import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '../strategies/jwt.strategy';

/**
 * RolesGuard implements role-based access control.
 *
 * Current behavior (Stage 1):
 * - If route has @Roles() decorator with required roles:
 *   - Check if user object has a role property
 *   - If user has no role, throw ForbiddenException
 *   - If user has role, check if it matches required roles
 *
 * Future stages will populate user.role from Membership lookup.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (set by JwtAuthGuard/JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user: RequestUser = request.user;

    // If no user on request, deny access
    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    // If user has no role property, deny access
    // This is the expected behavior in Stage 1 where Membership is not yet implemented
    if (!user.role) {
      throw new ForbiddenException(
        'Access denied: User has no role assigned. Role assignment via Membership will be available in a future update.',
      );
    }

    // Check if user's role is in the required roles list
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
