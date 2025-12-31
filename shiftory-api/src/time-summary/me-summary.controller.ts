import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { TimeSummaryService } from './time-summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';

/**
 * MeSummaryController handles personal summary endpoints for workers
 */
@Controller('stores/:storeId/me/summary')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class MeSummaryController {
  constructor(private readonly timeSummaryService: TimeSummaryService) {}

  /**
   * Get weekly summary for current user
   * GET /stores/:storeId/me/summary/weekly?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Requires: Store membership
   */
  @Get('weekly')
  async getWeeklySummary(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timeSummaryService.getWeeklySummary(
      storeId,
      user.id,
      from,
      to,
    );
  }

  /**
   * Get monthly summary for current user
   * GET /stores/:storeId/me/summary/monthly/:year-:month
   * Requires: Store membership
   */
  @Get('monthly/:year-:month')
  async getMonthlySummary(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timeSummaryService.getMonthlySummary(
      storeId,
      user.id,
      year,
      month,
    );
  }
}

