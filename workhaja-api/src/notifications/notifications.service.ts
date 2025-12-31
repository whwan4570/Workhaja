import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  Prisma,
} from '@prisma/client';

export interface CreateNotificationInput {
  storeId: string;
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: any;
  scheduledAt?: Date;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueue an in-app notification
   * Creates notification and job for processing
   */
  async enqueueInAppNotification(input: CreateNotificationInput): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        storeId: input.storeId,
        userId: input.userId,
        type: input.type,
        channel: input.channel || NotificationChannel.IN_APP,
        status: NotificationStatus.PENDING,
        title: input.title,
        message: input.message,
        data: input.data || {},
        scheduledAt: input.scheduledAt || new Date(),
      },
    });

    // Create job for processing
    await this.prisma.notificationJob.create({
      data: {
        notificationId: notification.id,
        status: NotificationStatus.PENDING,
        runAt: input.scheduledAt || new Date(),
      },
    });
  }

  /**
   * Enqueue notifications for multiple users
   */
  async enqueueForUsers(
    storeId: string,
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<void> {
    const notifications = userIds.map((userId) => ({
      storeId,
      userId,
      type,
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.PENDING,
      title,
      message,
      data: data || {},
      scheduledAt: new Date(),
    }));

    // Batch create notifications
    const created = await this.prisma.notification.createMany({
      data: notifications,
    });

    // Create jobs for each notification
    const notificationIds = await this.prisma.notification.findMany({
      where: {
        storeId,
        userId: { in: userIds },
        type,
        status: NotificationStatus.PENDING,
        createdAt: {
          gte: new Date(Date.now() - 1000), // Created in last second
        },
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: userIds.length,
    });

    await this.prisma.notificationJob.createMany({
      data: notificationIds.map((n) => ({
        notificationId: n.id,
        status: NotificationStatus.PENDING,
        runAt: new Date(),
      })),
    });
  }

  /**
   * List notifications for a user in a store
   */
  async listNotifications(
    storeId: string,
    userId: string,
    params: {
      unread?: boolean;
      limit?: number;
      cursor?: string;
    },
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const limit = Math.min(params.limit || 20, 100);
    const where: Prisma.NotificationWhereInput = {
      storeId,
      userId,
    };

    if (params.unread === true) {
      where.readAt = null;
    }

    // Parse cursor if provided
    let skip = 0;
    if (params.cursor) {
      try {
        const [createdAt, id] = params.cursor.split('|');
        where.OR = [
          {
            createdAt: { lt: new Date(createdAt) },
          },
          {
            createdAt: new Date(createdAt),
            id: { lt: id },
          },
        ];
      } catch {
        // Invalid cursor, ignore
      }
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      take: limit + 1, // Fetch one extra to check if there's more
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;

    const nextCursor =
      hasMore && items.length > 0
        ? `${items[items.length - 1].createdAt.toISOString()}|${items[items.length - 1].id}`
        : undefined;

    return { items, nextCursor };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    storeId: string,
    userId: string,
    notificationId: string,
  ): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        storeId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.readAt) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    }
  }

  /**
   * Mark all notifications as read for user in store
   */
  async markAllAsRead(storeId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        storeId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  /**
   * Get unread count for user in store
   */
  async getUnreadCount(storeId: string, userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        storeId,
        userId,
        readAt: null,
        status: NotificationStatus.SENT,
      },
    });
  }
}

