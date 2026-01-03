import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ManagerPermission } from '../decorators/permissions.decorator';
import { Role } from '@prisma/client';

/**
 * PermissionsGuard checks if user has required permissions.
 * 
 * Rules:
 * - OWNER always has all permissions
 * - MANAGER needs to have the required permission in their permissions array
 * - WORKER never has manager permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from @RequirePermission() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<ManagerPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request (set by JwtAuthGuard/JwtStrategy and StoreContextInterceptor)
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const membership = request.membership; // Set by StoreContextInterceptor

    // If no user on request, deny access
    if (!user) {
      throw new ForbiddenException('Access denied: Authentication required');
    }

    // OWNER always has all permissions
    if (membership?.role === Role.OWNER) {
      return true;
    }

    // If user is not MANAGER, deny access
    if (membership?.role !== Role.MANAGER) {
      throw new ForbiddenException(
        'Access denied: This action requires MANAGER role with appropriate permissions',
      );
    }

    // Get manager permissions from membership
    const managerPermissions = membership.permissions as string[] | null;
    if (!managerPermissions || !Array.isArray(managerPermissions)) {
      throw new ForbiddenException(
        'Access denied: Manager has no permissions assigned',
      );
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      managerPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Access denied: Required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

