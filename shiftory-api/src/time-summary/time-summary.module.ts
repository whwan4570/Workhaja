import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MeSummaryController } from './me-summary.controller';
import { AdminSummaryController } from './admin-summary.controller';
import { TimeSummaryService } from './time-summary.service';

/**
 * TimeSummaryModule handles time and labor summary calculations
 */
@Module({
  imports: [PrismaModule],
  controllers: [MeSummaryController, AdminSummaryController],
  providers: [TimeSummaryService],
  exports: [TimeSummaryService],
})
export class TimeSummaryModule {}

