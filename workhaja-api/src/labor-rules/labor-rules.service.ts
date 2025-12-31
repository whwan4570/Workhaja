import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLaborRulesDto } from './dto/update-labor-rules.dto';
import { Role } from '@prisma/client';

/**
 * LaborRulesService handles labor rules operations
 */
@Injectable()
export class LaborRulesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get labor rules for a store
   * @param storeId - Store ID
   * @param userId - User ID (for membership check)
   * @returns Labor rules
   */
  async getLaborRules(storeId: string, userId: string) {
    // Verify user is a member
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to view labor rules',
      );
    }

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        overtimeDailyEnabled: true,
        overtimeDailyMinutes: true,
        overtimeWeeklyEnabled: true,
        overtimeWeeklyMinutes: true,
        breakPaid: true,
        weekStartsOn: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /**
   * Update labor rules for a store
   * @param storeId - Store ID
   * @param userId - User ID (must be OWNER)
   * @param updateDto - Labor rules update data
   * @returns Updated labor rules
   */
  async updateLaborRules(
    storeId: string,
    userId: string,
    updateDto: UpdateLaborRulesDto,
  ) {
    // Verify user is OWNER
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this store to update labor rules',
      );
    }

    if (membership.role !== Role.OWNER) {
      throw new ForbiddenException(
        'Only OWNER can update labor rules',
      );
    }

    // Verify store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Update labor rules
    const updated = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        overtimeDailyEnabled: updateDto.overtimeDailyEnabled,
        overtimeDailyMinutes: updateDto.overtimeDailyMinutes,
        overtimeWeeklyEnabled: updateDto.overtimeWeeklyEnabled,
        overtimeWeeklyMinutes: updateDto.overtimeWeeklyMinutes,
        breakPaid: updateDto.breakPaid,
        weekStartsOn: updateDto.weekStartsOn,
      },
      select: {
        id: true,
        overtimeDailyEnabled: true,
        overtimeDailyMinutes: true,
        overtimeWeeklyEnabled: true,
        overtimeWeeklyMinutes: true,
        breakPaid: true,
        weekStartsOn: true,
      },
    });

    return updated;
  }
}

