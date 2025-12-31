import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseTimeToMinutes,
  calculateDurationMinutes,
  getWeekKey,
} from './utils/time.utils';
import { Role } from '@prisma/client';

/**
 * Overtime calculation policy
 * MVP uses maximum approach: overtimeMins = max(sumDailyOvertime, weeklyOverage)
 * This means we take the higher of daily overtime sum or weekly overage
 */
const OVERTIME_POLICY = 'MAX_DAILY_OR_WEEKLY';

/**
 * TimeSummaryService handles time and labor calculations
 */
@Injectable()
export class TimeSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get weekly summary for a user
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be the same as target)
   * @param from - Start date (YYYY-MM-DD)
   * @param to - End date (YYYY-MM-DD)
   * @returns Weekly summary
   */
  async getWeeklySummary(
    storeId: string,
    userId: string,
    from: string,
    to: string,
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
        'You must be a member of this store to view summaries',
      );
    }

    // Get store with labor rules
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Parse dates
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    // Get shifts
    const shifts = await this.prisma.shift.findMany({
      where: {
        storeId,
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        isCanceled: false,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate summary
    const summary = this.calculateWeeklySummary(
      shifts,
      store,
      fromDate,
      toDate,
    );

    return {
      storeId,
      userId,
      range: {
        from,
        to,
      },
      ...summary,
    };
  }

  /**
   * Get monthly summary for a user
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be the same as target)
   * @param year - Year
   * @param month - Month (1-12)
   * @returns Monthly summary
   */
  async getMonthlySummary(
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
        'You must be a member of this store to view summaries',
      );
    }

    // Get store with labor rules
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate date range for the month
    const fromDate = new Date(year, month - 1, 1);
    fromDate.setHours(0, 0, 0, 0);
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = new Date(year, month - 1, lastDay);
    toDate.setHours(23, 59, 59, 999);

    // Get shifts
    const shifts = await this.prisma.shift.findMany({
      where: {
        storeId,
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        isCanceled: false,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate summary
    const summary = this.calculateMonthlySummary(shifts, store, year, month);

    return {
      storeId,
      userId,
      year,
      month,
      ...summary,
    };
  }

  /**
   * Get monthly summary for all staff (admin)
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be OWNER or MANAGER)
   * @param year - Year
   * @param month - Month (1-12)
   * @returns Monthly summary by staff
   */
  async getMonthlySummaryByStaff(
    storeId: string,
    userId: string,
    year: number,
    month: number,
  ) {
    // Verify user is OWNER or MANAGER
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
        'You must be a member of this store to view summaries',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can view staff summaries',
      );
    }

    // Get store with labor rules
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate date range for the month
    const fromDate = new Date(year, month - 1, 1);
    fromDate.setHours(0, 0, 0, 0);
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = new Date(year, month - 1, lastDay);
    toDate.setHours(23, 59, 59, 999);

    // Get all shifts for the month
    const shifts = await this.prisma.shift.findMany({
      where: {
        storeId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        isCanceled: false,
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
      orderBy: {
        date: 'asc',
      },
    });

    // Group by user
    const shiftsByUser = new Map<string, typeof shifts>();
    for (const shift of shifts) {
      const userId = shift.userId;
      if (!shiftsByUser.has(userId)) {
        shiftsByUser.set(userId, []);
      }
      shiftsByUser.get(userId)!.push(shift);
    }

    // Calculate summary for each user
    const items = Array.from(shiftsByUser.entries()).map(
      ([userId, userShifts]) => {
        const summary = this.calculateMonthlySummary(
          userShifts,
          store,
          year,
          month,
        );
        const user = userShifts[0].user;
        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          totalMins: summary.totalMins,
          overtimeMins: summary.overtimeMins,
          breakMinsTotal: summary.breakMinsTotal,
          paidMins: summary.paidMins,
        };
      },
    );

    return {
      storeId,
      year,
      month,
      items,
    };
  }

  /**
   * Get monthly summary for a specific user (admin)
   * @param storeId - Store ID
   * @param userId - User ID (requester, must be OWNER or MANAGER)
   * @param targetUserId - Target user ID
   * @param year - Year
   * @param month - Month (1-12)
   * @returns Monthly summary for the user
   */
  async getUserMonthlySummary(
    storeId: string,
    userId: string,
    targetUserId: string,
    year: number,
    month: number,
  ) {
    // Verify user is OWNER or MANAGER
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
        'You must be a member of this store to view summaries',
      );
    }

    if (
      membership.role !== Role.OWNER &&
      membership.role !== Role.MANAGER
    ) {
      throw new ForbiddenException(
        'Only OWNER and MANAGER can view user summaries',
      );
    }

    // Verify target user is a member
    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_storeId: {
          userId: targetUserId,
          storeId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Target user is not a member of this store');
    }

    // Get store with labor rules
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate date range for the month
    const fromDate = new Date(year, month - 1, 1);
    fromDate.setHours(0, 0, 0, 0);
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = new Date(year, month - 1, lastDay);
    toDate.setHours(23, 59, 59, 999);

    // Get shifts
    const shifts = await this.prisma.shift.findMany({
      where: {
        storeId,
        userId: targetUserId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        isCanceled: false,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate summary
    const summary = this.calculateMonthlySummary(shifts, store, year, month);

    return {
      storeId,
      userId: targetUserId,
      year,
      month,
      ...summary,
    };
  }

  /**
   * Calculate weekly summary from shifts
   */
  private calculateWeeklySummary(
    shifts: any[],
    store: any,
    fromDate: Date,
    toDate: Date,
  ) {
    const byDay: any[] = [];
    let totalMins = 0;
    let breakMinsTotal = 0;
    let paidMins = 0;
    let overtimeMins = 0;

    // Group shifts by day
    const shiftsByDay = new Map<string, typeof shifts>();
    for (const shift of shifts) {
      const dateKey = shift.date.toISOString().split('T')[0];
      if (!shiftsByDay.has(dateKey)) {
        shiftsByDay.set(dateKey, []);
      }
      shiftsByDay.get(dateKey)!.push(shift);
    }

    // Calculate daily summaries
    const dailyOvertime: number[] = [];
    for (const [dateKey, dayShifts] of shiftsByDay.entries()) {
      let dayTotalMins = 0;
      let dayBreakMins = 0;
      let dayPaidMins = 0;

      for (const shift of dayShifts) {
        try {
          const shiftDurationMins = calculateDurationMinutes(
            shift.startTime,
            shift.endTime,
          );
          const unpaidBreakMins = store.breakPaid ? 0 : shift.breakMins;
          const shiftPaidMins = shiftDurationMins - unpaidBreakMins;

          dayTotalMins += shiftDurationMins;
          dayBreakMins += shift.breakMins;
          dayPaidMins += shiftPaidMins;
        } catch (error) {
          // Skip invalid shifts (e.g., night shifts)
          continue;
        }
      }

      // Calculate daily overtime
      let dayOvertime = 0;
      if (store.overtimeDailyEnabled && dayPaidMins > store.overtimeDailyMinutes) {
        dayOvertime = dayPaidMins - store.overtimeDailyMinutes;
        dailyOvertime.push(dayOvertime);
      }

      byDay.push({
        date: dateKey,
        totalMins: dayTotalMins,
        breakMins: dayBreakMins,
        paidMins: dayPaidMins,
        overtimeMins: dayOvertime,
      });

      totalMins += dayTotalMins;
      breakMinsTotal += dayBreakMins;
      paidMins += dayPaidMins;
    }

    // Calculate weekly overtime
    let weeklyOvertime = 0;
    if (store.overtimeWeeklyEnabled) {
      const weeklyPaidMins = paidMins;
      if (weeklyPaidMins > store.overtimeWeeklyMinutes) {
        weeklyOvertime = weeklyPaidMins - store.overtimeWeeklyMinutes;
      }
    }

    // Apply overtime policy
    if (OVERTIME_POLICY === 'MAX_DAILY_OR_WEEKLY') {
      const sumDailyOvertime = dailyOvertime.reduce((a, b) => a + b, 0);
      overtimeMins = Math.max(sumDailyOvertime, weeklyOvertime);
    } else {
      // Default to weekly overtime
      overtimeMins = weeklyOvertime;
    }

    return {
      totalMins,
      overtimeMins,
      breakMinsTotal,
      paidMins,
      byDay,
    };
  }

  /**
   * Calculate monthly summary from shifts
   */
  private calculateMonthlySummary(
    shifts: any[],
    store: any,
    year: number,
    month: number,
  ) {
    let totalMins = 0;
    let breakMinsTotal = 0;
    let paidMins = 0;
    let overtimeMins = 0;

    // Group shifts by week
    const shiftsByWeek = new Map<string, typeof shifts>();
    for (const shift of shifts) {
      const weekKey = getWeekKey(shift.date, store.weekStartsOn);
      if (!shiftsByWeek.has(weekKey)) {
        shiftsByWeek.set(weekKey, []);
      }
      shiftsByWeek.get(weekKey)!.push(shift);
    }

    // Calculate weekly summaries
    const weeklyOvertimes: number[] = [];
    const dailyOvertimes: number[] = [];

    for (const [weekKey, weekShifts] of shiftsByWeek.entries()) {
      // Group by day
      const shiftsByDay = new Map<string, typeof shifts>();
      for (const shift of weekShifts) {
        const dateKey = shift.date.toISOString().split('T')[0];
        if (!shiftsByDay.has(dateKey)) {
          shiftsByDay.set(dateKey, []);
        }
        shiftsByDay.get(dateKey)!.push(shift);
      }

      // Calculate daily overtime
      for (const [dateKey, dayShifts] of shiftsByDay.entries()) {
        let dayPaidMins = 0;

        for (const shift of dayShifts) {
          try {
            const shiftDurationMins = calculateDurationMinutes(
              shift.startTime,
              shift.endTime,
            );
            const unpaidBreakMins = store.breakPaid ? 0 : shift.breakMins;
            const shiftPaidMins = shiftDurationMins - unpaidBreakMins;

            dayPaidMins += shiftPaidMins;
            totalMins += shiftDurationMins;
            breakMinsTotal += shift.breakMins;
            paidMins += shiftPaidMins;
          } catch (error) {
            // Skip invalid shifts
            continue;
          }
        }

        // Daily overtime
        if (store.overtimeDailyEnabled && dayPaidMins > store.overtimeDailyMinutes) {
          const dayOvertime = dayPaidMins - store.overtimeDailyMinutes;
          dailyOvertimes.push(dayOvertime);
        }
      }

      // Weekly overtime
      let weekPaidMins = 0;
      for (const shift of weekShifts) {
        try {
          const shiftDurationMins = calculateDurationMinutes(
            shift.startTime,
            shift.endTime,
          );
          const unpaidBreakMins = store.breakPaid ? 0 : shift.breakMins;
          weekPaidMins += shiftDurationMins - unpaidBreakMins;
        } catch (error) {
          continue;
        }
      }

      if (store.overtimeWeeklyEnabled && weekPaidMins > store.overtimeWeeklyMinutes) {
        const weekOvertime = weekPaidMins - store.overtimeWeeklyMinutes;
        weeklyOvertimes.push(weekOvertime);
      }
    }

    // Apply overtime policy
    if (OVERTIME_POLICY === 'MAX_DAILY_OR_WEEKLY') {
      const sumDailyOvertime = dailyOvertimes.reduce((a, b) => a + b, 0);
      const maxWeeklyOvertime = weeklyOvertimes.length > 0
        ? Math.max(...weeklyOvertimes)
        : 0;
      overtimeMins = Math.max(sumDailyOvertime, maxWeeklyOvertime);
    } else {
      // Sum all weekly overtimes
      overtimeMins = weeklyOvertimes.reduce((a, b) => a + b, 0);
    }

    return {
      totalMins,
      overtimeMins,
      breakMinsTotal,
      paidMins,
    };
  }
}

