import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LaborRulesController } from './labor-rules.controller';
import { LaborRulesService } from './labor-rules.service';

/**
 * LaborRulesModule handles labor rules operations
 */
@Module({
  imports: [PrismaModule],
  controllers: [LaborRulesController],
  providers: [LaborRulesService],
  exports: [LaborRulesService],
})
export class LaborRulesModule {}

