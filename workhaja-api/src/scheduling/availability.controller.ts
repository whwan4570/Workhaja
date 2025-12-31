import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';

/**
 * AvailabilityController handles availability endpoints
 */
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Create or update availability
   * POST /stores/:storeId/months/:year-:month/availability
   * Requires: Store membership (users can only submit their own availability)
   */
  @Post('months/:year-:month/availability')
  async upsertAvailability(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
    @Body() upsertAvailabilityDto: UpsertAvailabilityDto,
  ) {
    return this.availabilityService.upsertAvailability(
      storeId,
      user.id,
      year,
      month,
      upsertAvailabilityDto,
    );
  }

  /**
   * Delete availability
   * DELETE /stores/:storeId/availability/:availabilityId
   * Requires: Store membership (users can only delete their own availability)
   */
  @Delete('availability/:availabilityId')
  async deleteAvailability(
    @Param('storeId') storeId: string,
    @Param('availabilityId') availabilityId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.availabilityService.deleteAvailability(
      storeId,
      user.id,
      availabilityId,
    );
  }

  /**
   * List availability for a month
   * GET /stores/:storeId/months/:year-:month/availability
   * Requires: Store membership
   * Workers can only see their own availability
   */
  @Get('months/:year-:month/availability')
  async listAvailability(
    @Param('storeId') storeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.availabilityService.listAvailability(
      storeId,
      user.id,
      year,
      month,
    );
  }
}
