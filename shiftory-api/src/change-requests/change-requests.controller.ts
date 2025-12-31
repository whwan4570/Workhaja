import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseEnumPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ChangeRequestsService } from './change-requests.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ApproveChangeRequestDto } from './dto/approve-change-request.dto';
import { RejectChangeRequestDto } from './dto/reject-change-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role, ChangeRequestStatus, ChangeRequestType } from '@prisma/client';

/**
 * ChangeRequestsController handles change request endpoints
 */
@Controller('stores/:storeId/requests')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class ChangeRequestsController {
  constructor(
    private readonly changeRequestsService: ChangeRequestsService,
  ) {}

  /**
   * Create a change request
   * POST /stores/:storeId/requests
   * Requires: Store membership
   */
  @Post()
  async createRequest(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() createDto: CreateChangeRequestDto,
  ) {
    return this.changeRequestsService.createRequest(
      storeId,
      user.id,
      createDto,
    );
  }

  /**
   * List change requests
   * GET /stores/:storeId/requests?status=PENDING&type=...&mine=true
   * Requires: Store membership
   */
  @Get()
  async listRequests(
    @Param('storeId') storeId: string,
    @Query('status') status?: ChangeRequestStatus,
    @Query('type') type?: ChangeRequestType,
    @Query('mine') mine?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    const mineBool = mine === 'true' || mine === '1';
    return this.changeRequestsService.listRequests(
      storeId,
      user.id,
      status,
      type,
      mineBool,
    );
  }

  /**
   * Get change request detail
   * GET /stores/:storeId/requests/:requestId
   * Requires: Store membership
   */
  @Get(':requestId')
  async getRequest(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.changeRequestsService.getRequest(
      storeId,
      user.id,
      requestId,
    );
  }

  /**
   * Cancel a change request
   * POST /stores/:storeId/requests/:requestId/cancel
   * Requires: Store membership (only creator can cancel)
   */
  @Post(':requestId/cancel')
  async cancelRequest(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.changeRequestsService.cancelRequest(
      storeId,
      user.id,
      requestId,
    );
  }

  /**
   * Approve a change request
   * POST /stores/:storeId/requests/:requestId/approve
   * Requires: OWNER or MANAGER role
   */
  @Post(':requestId/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async approveRequest(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
    @Body() approveDto: ApproveChangeRequestDto,
  ) {
    return this.changeRequestsService.approveRequest(
      storeId,
      user.id,
      requestId,
      approveDto,
    );
  }

  /**
   * Reject a change request
   * POST /stores/:storeId/requests/:requestId/reject
   * Requires: OWNER or MANAGER role
   */
  @Post(':requestId/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async rejectRequest(
    @Param('storeId') storeId: string,
    @Param('requestId') requestId: string,
    @CurrentUser() user: RequestUser,
    @Body() rejectDto: RejectChangeRequestDto,
  ) {
    return this.changeRequestsService.rejectRequest(
      storeId,
      user.id,
      requestId,
      rejectDto,
    );
  }
}
