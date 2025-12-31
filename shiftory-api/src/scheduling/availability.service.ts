import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

/**
 * AvailabilityService handles availability operations
 */
@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update availability
   * @param storeId - Store ID
   * @param userId - User ID (must be the owner of the availability)
   * @param year - Year of the month
   * @param month - Month (1-12)
   * @param upsertAvailabilityDto - Availability data
   * @returns Created or updated availability
   * @throws NotFoundException if month not found
   * @throws ForbiddenException if month is published or user lacks permission
   */
  async upsertAvailability(
    storeId: string,
    userId: string,
    year: number,
    month: number,
    upsertAvailabilityDto: UpsertAvailabilityDto,
  ) {
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
        'You must be a member of this store to submit availability',
      );
    }

    // Get month
    const scheduleMonth = await this.prisma.scheduleMonth.findUnique({
      where: {
        storeId_year_month: {
          storeId,
          year,
          month,
        },
      },
    });

    if (!scheduleMonth) {
      throw new NotFoundException(
        `Schedule month for ${year}-${month.toString().padStart(2, '0')} not found`,
      );
    }

    // Check if month is published (lockAt check)
    // Simplified: if PUBLISHED, no modifications allowed
    if (scheduleMonth.status === 'PUBLISHED') {
      throw new ForbiddenException(
        'Cannot modify availability for a published schedule month',
      );
    }

    // Validate date belongs to month
    const dateObj = new Date(upsertAvailabilityDto.date);
    const dateYear = dateObj.getFullYear();
    const dateMonth = dateObj.getMonth() + 1;

    if (dateYear !== year || dateMonth !== month) {
      throw new BadRequestException(
        `Date ${upsertAvailabilityDto.date} does not belong to month ${year}-${month.toString().padStart(2, '0')}`,
      );
    }

    // Parse date
    const parsedDate = new Date(upsertAvailabilityDto.date);
    parsedDate.setHours(0, 0, 0, 0);

    // Check if availability already exists for this user, date, startTime, endTime combination
    const existing = await this.prisma.availability.findFirst({
      where: {
        storeId,
        userId,
        monthId: scheduleMonth.id,
        date: parsedDate,
        startTime: upsertAvailabilityDto.startTime || null,
        endTime: upsertAvailabilityDto.endTime || null,
      },
    });

    if (existing) {
      // Update existing
      const updated = await this.prisma.availability.update({
        where: { id: existing.id },
        data: {
          startTime: upsertAvailabilityDto.startTime || null,
          endTime: upsertAvailabilityDto.endTime || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return updated;
    } else {
      // Create new
      const created = await this.prisma.availability.create({
        data: {
          storeId,
          userId,
          monthId: scheduleMonth.id,
          date: parsedDate,
          startTime: upsertAvailabilityDto.startTime || null,
          endTime: upsertAvailabilityDto.endTime || null,
          type: 'UNAVAILABLE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return created;
    }
  }

  /**
   * Delete availability
   * @param storeId - Store ID
   * @param userId - User ID (must be the owner of the availability)
   * @param availabilityId - Availability ID
   * @throws NotFoundException if availability not found
   * @throws ForbiddenException if month is published or user is not the owner
   */
  async deleteAvailability(
    storeId: string,
    userId: string,
    availabilityId: string,
  ) {
    // Get availability with month
    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: {
        month: true,
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.storeId !== storeId) {
      throw new ForbiddenException(
        'Availability does not belong to this store',
      );
    }

    // Only the owner can delete their own availability
    if (availability.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own availability',
      );
    }

    // Check if month is published
    if (availability.month.status === 'PUBLISHED') {
      throw new ForbiddenException(
        'Cannot delete availability for a published schedule month',
      );
    }

    // Delete availability
    await this.prisma.availability.delete({
      where: { id: availabilityId },
    });

    return { ok: true };
  }

  /**
   * List availability for a month
   * @param storeId - Store ID
   * @param userId - User ID (requester)
   * @param year - Year
   * @param month - Month (1-12)
   * @returns List of availability
   * @throws NotFoundException if month not found
   * @throws ForbiddenException if user is not a member
   */
  async listAvailability(
    storeId: string,
    userId: string,
    year: number,
    month: number,
  ) {
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
        'You must be a member of this store to view availability',
      );
    }

    // Get month
    const scheduleMonth = await this.prisma.scheduleMonth.findUnique({
      where: {
        storeId_year_month: {
          storeId,
          year,
          month,
        },
      },
    });

    if (!scheduleMonth) {
      throw new NotFoundException(
        `Schedule month for ${year}-${month.toString().padStart(2, '0')} not found`,
      );
    }

    // Build where clause
    // Workers can only see their own availability
    // Managers and Owners can see all
    const where: any = {
      storeId,
      monthId: scheduleMonth.id,
    };

    if (membership.role === 'WORKER') {
      where.userId = userId;
    }

    // Fetch availability
    const availabilities = await this.prisma.availability.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return availabilities;
  }
}
