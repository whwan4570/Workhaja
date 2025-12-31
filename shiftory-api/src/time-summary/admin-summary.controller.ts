import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { TimeSummaryService } from './time-summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role } from '@prisma/client';

/**
 * AdminSummaryController handles admin summary endpoints
 */
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class AdminSummaryController {
  constructor(private readonly timeSummaryService: TimeSummaryService) {}

  /**
   * Get monthly summary for all staff
   * GET /stores/:storeId/summary/monthly/:year-:month
   * Requires: OWNER or MANAGER role
   */
  @Get('summary/monthly/:year-:month')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async getMonthlySummaryByStaff(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timeSummaryService.getMonthlySummaryByStaff(
      storeId,
      user.id,
      year,
      month,
    );
  }

  /**
   * Get monthly summary for a specific user
   * GET /stores/:storeId/users/:userId/summary/monthly/:year-:month
   * Requires: OWNER or MANAGER role
   */
  @Get('users/:userId/summary/monthly/:year-:month')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async getUserMonthlySummary(
    @Param('storeId') storeId: string,
    @Param('userId') targetUserId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timeSummaryService.getUserMonthlySummary(
      storeId,
      user.id,
      targetUserId,
      year,
      month,
    );
  }
}

