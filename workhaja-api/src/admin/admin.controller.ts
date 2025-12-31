import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';

/**
 * AdminController demonstrates role-based access control.
 * Endpoints here require specific roles to access.
 */
@Controller('admin')
export class AdminController {
  /**
   * Ping endpoint for testing OWNER role access
   * GET /admin/ping
   * Headers: Authorization: Bearer <token>
   * Requires: OWNER role
   *
   * Note: In Stage 1, this will return 403 Forbidden because
   * users don't have roles assigned yet (Membership not implemented).
   * This demonstrates the RolesGuard working correctly.
   */
  @Get('ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  ping(@CurrentUser() user: RequestUser) {
    return {
      message: 'pong',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Manager endpoint for testing MANAGER or OWNER access
   * GET /admin/manager-ping
   * Headers: Authorization: Bearer <token>
   * Requires: OWNER or MANAGER role
   */
  @Get('manager-ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  managerPing(@CurrentUser() user: RequestUser) {
    return {
      message: 'manager pong',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
