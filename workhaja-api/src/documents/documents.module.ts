import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChangeRequestsModule } from '../change-requests/change-requests.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * DocumentsModule handles document and submission management
 */
@Module({
  imports: [PrismaModule, ChangeRequestsModule, forwardRef(() => NotificationsModule)],
  controllers: [DocumentsController, SubmissionsController],
  providers: [DocumentsService, SubmissionsService],
  exports: [DocumentsService, SubmissionsService],
})
export class DocumentsModule {}

