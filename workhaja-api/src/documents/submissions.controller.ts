import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitSubmissionDto } from './dto/submit-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { Role, DocumentType, SubmissionStatus } from '@prisma/client';

/**
 * SubmissionsController handles document submission endpoints
 */
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /**
   * Submit a document submission
   * POST /stores/:storeId/me/submissions
   * Requires: Store membership
   */
  @Post('me/submissions')
  async submitSubmission(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() submitDto: SubmitSubmissionDto,
  ) {
    return this.submissionsService.submitSubmission(
      storeId,
      user.id,
      submitDto,
    );
  }

  /**
   * List user's own submissions
   * GET /stores/:storeId/me/submissions
   * Requires: Store membership
   */
  @Get('me/submissions')
  async listMySubmissions(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.submissionsService.listMySubmissions(storeId, user.id);
  }

  /**
   * List submissions (admin dashboard)
   * GET /stores/:storeId/submissions?type=HEALTH_CERT&status=SUBMITTED&missing=true
   * Requires: OWNER or MANAGER role
   */
  @Get('submissions')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async listSubmissions(
    @Param('storeId') storeId: string,
    @Query('type') type?: DocumentType,
    @Query('status') status?: SubmissionStatus,
    @Query('missing') missing?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    const missingBool = missing === 'true' || missing === '1';
    return this.submissionsService.listSubmissions(
      storeId,
      user.id,
      type,
      status,
      missingBool,
    );
  }

  /**
   * Approve a submission
   * POST /stores/:storeId/submissions/:submissionId/approve
   * Requires: OWNER or MANAGER role
   */
  @Post('submissions/:submissionId/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async approveSubmission(
    @Param('storeId') storeId: string,
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: RequestUser,
    @Body() reviewDto: ReviewSubmissionDto,
  ) {
    return this.submissionsService.approveSubmission(
      storeId,
      user.id,
      submissionId,
      reviewDto,
    );
  }

  /**
   * Reject a submission
   * POST /stores/:storeId/submissions/:submissionId/reject
   * Requires: OWNER or MANAGER role
   */
  @Post('submissions/:submissionId/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async rejectSubmission(
    @Param('storeId') storeId: string,
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: RequestUser,
    @Body() reviewDto: ReviewSubmissionDto,
  ) {
    return this.submissionsService.rejectSubmission(
      storeId,
      user.id,
      submissionId,
      reviewDto,
    );
  }

  /**
   * Get expiring submissions
   * GET /stores/:storeId/submissions/expiring?type=HEALTH_CERT&days=30
   * Requires: OWNER or MANAGER role
   */
  @Get('submissions/expiring')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async getExpiringSubmissions(
    @Param('storeId') storeId: string,
    @Query('type') type?: DocumentType,
    @Query('days') days?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.submissionsService.getExpiringSubmissions(
      storeId,
      user.id,
      type,
      daysNum,
    );
  }

  /**
   * Get expired submissions
   * GET /stores/:storeId/submissions/expired?type=HEALTH_CERT
   * Requires: OWNER or MANAGER role
   */
  @Get('submissions/expired')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  async getExpiredSubmissions(
    @Param('storeId') storeId: string,
    @Query('type') type?: DocumentType,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    return this.submissionsService.getExpiredSubmissions(
      storeId,
      user.id,
      type,
    );
  }
}

