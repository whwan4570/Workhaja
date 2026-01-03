import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RolesGuard implements role-based access control.
 *
 * For store-scoped routes (with :storeId), this guard:
 * - Checks membership from database if user.role is not set
 * - Sets user.role from membership
 *
 * For non-store-scoped routes, user.role must be set elsewhere.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // If user.role is not set, try to get it from membership (for store-scoped routes)
    if (!user.role) {
      const storeId = request.params?.storeId;
      if (storeId) {
        const membership = await this.prisma.membership.findUnique({
          where: {
            userId_storeId: {
              userId: user.id,
              storeId: storeId,
            },
          },
        });

        if (!membership) {
          throw new ForbiddenException(
            'Access denied: You are not a member of this store',
          );
        }

        // Set user.role from membership
        user.role = membership.role;
        user.storeId = storeId;
        
        // Also store membership for PermissionsGuard
        request.membership = membership;
      } else {
        throw new ForbiddenException(
          'Access denied: User has no role assigned',
        );
      }
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
