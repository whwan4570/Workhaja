import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * UsersModule handles user-related operations.
 * Currently exports UsersService for use in AuthModule.
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
