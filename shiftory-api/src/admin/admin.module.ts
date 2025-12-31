import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

/**
 * AdminModule contains administrative endpoints
 * that require elevated privileges (role-based access).
 */
@Module({
  controllers: [AdminController],
})
export class AdminModule {}
