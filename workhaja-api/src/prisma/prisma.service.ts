import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService extends PrismaClient and implements NestJS lifecycle hooks
 * to properly manage database connections.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  /**
   * Connect to database when the module is initialized
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnect from database when the application shuts down
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
