import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles';

/**
 * Roles decorator for role-based access control.
 * Use with RolesGuard to restrict access to specific roles.
 *
 * @example
 * @Roles('OWNER', 'MANAGER')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * someProtectedMethod() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
