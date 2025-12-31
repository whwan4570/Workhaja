import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoreContextInterceptor } from '../stores/interceptors/store-context.interceptor';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { ListNotificationsDto } from './dto';

@Controller('stores/:storeId/me/notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(StoreContextInterceptor)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * List my notifications
   */
  @Get()
  async listNotifications(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notificationsService.listNotifications(
      storeId,
      user.id,
      {
        unread: query.unread,
        limit: query.limit,
        cursor: query.cursor,
      },
    );
  }

  /**
   * Mark notification as read
   */
  @Post(':id/read')
  async markAsRead(
    @Param('storeId') storeId: string,
    @Param('id') notificationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.notificationsService.markAsRead(storeId, user.id, notificationId);
    return { ok: true };
  }

  /**
   * Mark all notifications as read
   */
  @Post('read-all')
  async markAllAsRead(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.notificationsService.markAllAsRead(storeId, user.id);
    return { ok: true };
  }
}

