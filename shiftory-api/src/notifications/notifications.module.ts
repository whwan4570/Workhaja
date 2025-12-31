import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsAdminController } from './notifications.admin.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController, NotificationsAdminController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}

