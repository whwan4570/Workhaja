import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role } from '@prisma/client';

/**
 * ShiftsController handles shift CRUD endpoints
 */
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  /**
   * Create a new shift
   * POST /stores/:storeId/months/:year-:month/shifts
   * Requires: OWNER or MANAGER role
   */
  @Post('months/:year-:month/shifts')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @RequirePermission('manageShifts')
  async createShift(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
    @Body() createShiftDto: CreateShiftDto,
  ) {
    return this.shiftsService.createShift(
      storeId,
      user.id,
      year,
      month,
      createShiftDto,
    );
  }

  /**
   * Update a shift
   * PUT /stores/:storeId/shifts/:shiftId
   * Requires: OWNER or MANAGER role
   */
  @Put('shifts/:shiftId')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @RequirePermission('manageShifts')
  async updateShift(
    @Param('storeId') storeId: string,
    @Param('shiftId') shiftId: string,
    @CurrentUser() user: RequestUser,
    @Body() updateShiftDto: UpdateShiftDto,
  ) {
    return this.shiftsService.updateShift(
      storeId,
      user.id,
      shiftId,
      updateShiftDto,
    );
  }

  /**
   * Delete a shift
   * DELETE /stores/:storeId/shifts/:shiftId
   * Requires: OWNER or MANAGER role
   */
  @Delete('shifts/:shiftId')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @RequirePermission('manageShifts')
  async deleteShift(
    @Param('storeId') storeId: string,
    @Param('shiftId') shiftId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.shiftsService.deleteShift(storeId, user.id, shiftId);
  }

  /**
   * List shifts by date range
   * GET /stores/:storeId/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=optional&includeCanceled=false
   * Requires: Store membership
   * Workers can only view their own shifts
   */
  @Get('shifts')
  async listShifts(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('userId') filterUserId?: string,
    @Query('includeCanceled') includeCanceled?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    const includeCanceledBool =
      includeCanceled === 'true' || includeCanceled === '1';
    return this.shiftsService.listShifts(
      storeId,
      user.id,
      from,
      to,
      filterUserId,
      includeCanceledBool,
    );
  }
}
