import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChangeRequestsController } from './change-requests.controller';
import { ChangeRequestsService } from './change-requests.service';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { AuditService } from './audit.service';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * ChangeRequestsModule handles change request workflow operations
 */
@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  controllers: [ChangeRequestsController, CandidatesController],
  providers: [
    ChangeRequestsService,
    CandidatesService,
    AuditService,
  ],
  exports: [
    ChangeRequestsService,
    CandidatesService,
    AuditService,
  ],
})
export class ChangeRequestsModule {}
