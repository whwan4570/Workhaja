import { Module, forwardRef } from '@nestjs/common';
import { TotpService } from './totp.service';
import { TotpController } from './totp.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TimeEntriesModule } from '../time-entries/time-entries.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => TimeEntriesModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [TotpController],
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
