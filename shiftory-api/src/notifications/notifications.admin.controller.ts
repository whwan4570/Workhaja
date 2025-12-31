import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('stores/:storeId/admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'MANAGER')
@UseInterceptors(StoreContextInterceptor)
export class NotificationsAdminController {
  constructor(
    private readonly processor: NotificationsProcessor,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Check internal key from header
   */
  private checkInternalKey(headers: Record<string, string | string[] | undefined>): void {
    const internalKey = process.env.INTERNAL_KEY;
    if (!internalKey) {
      throw new UnauthorizedException('INTERNAL_KEY not configured');
    }

    const providedKey = headers['x-internal-key'];
    if (providedKey !== internalKey) {
      throw new UnauthorizedException('Invalid internal key');
    }
  }

  /**
   * Process pending notifications
   */
  @Post('run/process')
  @HttpCode(HttpStatus.OK)
  async processPending(
    @Param('storeId') storeId: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.checkInternalKey(headers);

    const processed = await this.processor.processPending(50);
    return { ok: true, processed };
  }

  /**
   * Trigger doc expiration notifications
   */
  @Post('run/doc-expiration')
  @HttpCode(HttpStatus.OK)
  async triggerDocExpiration(
    @Param('storeId') storeId: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.checkInternalKey(headers);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find expiring submissions
    const expiringSubmissions = await this.prisma.documentSubmission.findMany({
      where: {
        storeId,
        expiresAt: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        status: 'APPROVED',
      },
      include: {
        user: true,
      },
    });

    // Find expired submissions
    const expiredSubmissions = await this.prisma.documentSubmission.findMany({
      where: {
        storeId,
        expiresAt: {
          lt: now,
        },
        status: 'APPROVED',
      },
      include: {
        user: true,
      },
    });

    // Enqueue notifications for expiring
    for (const submission of expiringSubmissions) {
      const daysUntilExpiry = Math.ceil(
        (submission.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      await this.notificationsService.enqueueInAppNotification({
        storeId,
        userId: submission.userId,
        type: 'DOC_EXPIRING_SOON',
        title: 'Document Expiring Soon',
        message: `Your ${submission.type} expires in ${daysUntilExpiry} day(s)`,
        data: {
          submissionId: submission.id,
          type: submission.type,
          expiresAt: submission.expiresAt,
        },
      });
    }

    // Enqueue notifications for expired
    for (const submission of expiredSubmissions) {
      await this.notificationsService.enqueueInAppNotification({
        storeId,
        userId: submission.userId,
        type: 'DOC_EXPIRED',
        title: 'Document Expired',
        message: `Your ${submission.type} has expired`,
        data: {
          submissionId: submission.id,
          type: submission.type,
          expiresAt: submission.expiresAt,
        },
      });
    }

    return {
      ok: true,
      expiring: expiringSubmissions.length,
      expired: expiredSubmissions.length,
    };
  }

  /**
   * Trigger availability deadline notifications
   */
  @Post('run/availability-deadline')
  @HttpCode(HttpStatus.OK)
  async triggerAvailabilityDeadline(
    @Param('storeId') storeId: string,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    this.checkInternalKey(headers);

    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find months with lockAt within next 48 hours
    const months = await this.prisma.scheduleMonth.findMany({
      where: {
        storeId,
        lockAt: {
          gte: now,
          lte: fortyEightHoursFromNow,
        },
        status: 'PUBLISHED',
      },
    });

    // Get all store members
    const memberships = await this.prisma.membership.findMany({
      where: { storeId },
      include: { user: true },
    });

    // Enqueue notifications for each member
    for (const month of months) {
      for (const membership of memberships) {
        const hoursUntilDeadline = Math.ceil(
          (month.lockAt!.getTime() - now.getTime()) / (1000 * 60 * 60),
        );

        await this.notificationsService.enqueueInAppNotification({
          storeId,
          userId: membership.userId,
          type: 'AVAILABILITY_DEADLINE_SOON',
          title: 'Availability Deadline Approaching',
          message: `Availability deadline for ${month.year}-${String(month.month).padStart(2, '0')} is in ${hoursUntilDeadline} hour(s)`,
          data: {
            year: month.year,
            month: month.month,
            lockAt: month.lockAt,
          },
        });
      }
    }

    return {
      ok: true,
      months: months.length,
      notifications: months.length * memberships.length,
    };
  }
}

