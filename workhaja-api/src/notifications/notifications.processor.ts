import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process pending notification jobs
   * @param limit Maximum number of jobs to process
   */
  async processPending(limit: number = 50): Promise<number> {
    const now = new Date();

    // Find pending jobs ready to process
    const jobs = await this.prisma.notificationJob.findMany({
      where: {
        status: NotificationStatus.PENDING,
        runAt: { lte: now },
      },
      include: {
        notification: true,
      },
      take: limit,
      orderBy: { runAt: 'asc' },
    });

    let processed = 0;

    for (const job of jobs) {
      try {
        // For IN_APP channel, mark as sent immediately
        if (job.notification.channel === 'IN_APP') {
          await this.prisma.$transaction(async (tx) => {
            // Update notification status
            await tx.notification.update({
              where: { id: job.notificationId },
              data: {
                status: NotificationStatus.SENT,
                sentAt: new Date(),
              },
            });

            // Update job status
            await tx.notificationJob.update({
              where: { id: job.id },
              data: {
                status: NotificationStatus.SENT,
              },
            });
          });

          processed++;
        } else {
          // For other channels (EMAIL, PUSH), would implement actual sending here
          // For now, mark as sent
          await this.prisma.$transaction(async (tx) => {
            await tx.notification.update({
              where: { id: job.notificationId },
              data: {
                status: NotificationStatus.SENT,
                sentAt: new Date(),
              },
            });

            await tx.notificationJob.update({
              where: { id: job.id },
              data: {
                status: NotificationStatus.SENT,
              },
            });
          });

          processed++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to process notification job ${job.id}: ${error.message}`,
        );

        // Increment attempts and handle backoff
        const attempts = job.attempts + 1;
        const maxAttempts = 5;

        if (attempts >= maxAttempts) {
          // Mark as failed
          await this.prisma.notificationJob.update({
            where: { id: job.id },
            data: {
              status: NotificationStatus.FAILED,
              attempts,
              lastError: error.message,
            },
          });

          await this.prisma.notification.update({
            where: { id: job.notificationId },
            data: {
              status: NotificationStatus.FAILED,
            },
          });
        } else {
          // Calculate backoff: 30s, 2m, 10m, 1h, 6h
          const backoffSeconds = [30, 120, 600, 3600, 21600];
          const backoffMs = backoffSeconds[attempts - 1] * 1000;
          const nextRunAt = new Date(now.getTime() + backoffMs);

          await this.prisma.notificationJob.update({
            where: { id: job.id },
            data: {
              attempts,
              lastError: error.message,
              runAt: nextRunAt,
              // Keep status as PENDING
            },
          });
        }
      }
    }

    return processed;
  }
}

