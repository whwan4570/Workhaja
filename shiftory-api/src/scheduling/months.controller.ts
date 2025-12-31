import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { MonthsService } from './months.service';
import { CreateMonthDto } from './dto/create-month.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role } from '@prisma/client';

/**
 * MonthsController handles schedule month endpoints
 */
@Controller('stores/:storeId/months')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class MonthsController {
  constructor(private readonly monthsService: MonthsService) {}

  /**
   * Create a new schedule month
   * POST /stores/:storeId/months
   * Requires: OWNER or MANAGER role
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async createMonth(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() createMonthDto: CreateMonthDto,
  ) {
    return this.monthsService.createMonth(
      storeId,
      user.id,
      createMonthDto,
    );
  }

  /**
   * Get schedule month by year and month
   * GET /stores/:storeId/months/:year-:month
   * Example: GET /stores/:storeId/months/2026-01
   * Requires: Store membership
   */
  @Get(':year-:month')
  async getMonth(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.monthsService.getMonth(storeId, user.id, year, month);
  }

  /**
   * Publish (lock) a schedule month
   * POST /stores/:storeId/months/:year-:month/publish
   * Requires: OWNER role
   */
  @Post(':year-:month/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async publishMonth(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.monthsService.publishMonth(storeId, user.id, year, month);
  }
}
