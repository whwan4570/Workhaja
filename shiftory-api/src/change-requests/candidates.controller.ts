import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { ApplyCandidateDto } from './dto/apply-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';

/**
 * CandidatesController handles cover request candidate endpoints
 */
@Controller('stores/:storeId/requests/:requestId/candidates')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  /**
   * Apply as a candidate for a cover request
   * POST /stores/:storeId/requests/:requestId/candidates
   * Requires: Store membership
   */
  @Post()
  async applyCandidate(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
    @Body() applyDto: ApplyCandidateDto,
  ) {
    return this.candidatesService.applyCandidate(
      storeId,
      user.id,
      requestId,
      applyDto,
    );
  }

  /**
   * List candidates for a cover request
   * GET /stores/:storeId/requests/:requestId/candidates
   * Requires: Store membership
   */
  @Get()
  async listCandidates(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.candidatesService.listCandidates(
      storeId,
      user.id,
      requestId,
    );
  }
}
