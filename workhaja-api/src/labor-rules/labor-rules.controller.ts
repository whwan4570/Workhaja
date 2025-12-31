import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LaborRulesService } from './labor-rules.service';
import { UpdateLaborRulesDto } from './dto/update-labor-rules.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';

/**
 * LaborRulesController handles labor rules endpoints
 */
@Controller('stores/:storeId/labor-rules')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class LaborRulesController {
  constructor(private readonly laborRulesService: LaborRulesService) {}

  /**
   * Get labor rules for a store
   * GET /stores/:storeId/labor-rules
   * Requires: Store membership
   */
  @Get()
  async getLaborRules(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.laborRulesService.getLaborRules(storeId, user.id);
  }

  /**
   * Update labor rules for a store
   * PUT /stores/:storeId/labor-rules
   * Requires: OWNER role
   */
  @Put()
  async updateLaborRules(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() updateDto: UpdateLaborRulesDto,
  ) {
    return this.laborRulesService.updateLaborRules(
      storeId,
      user.id,
      updateDto,
    );
  }
}

