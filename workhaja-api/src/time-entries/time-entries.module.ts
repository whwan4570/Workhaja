import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntriesService } from './time-entries.service';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * TimeEntriesModule handles time entry (check-in/check-out) operations
 */
@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}

