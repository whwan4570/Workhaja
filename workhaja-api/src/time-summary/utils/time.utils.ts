/**
 * Time utility functions for labor calculations
 */

/**
 * Parse HH:mm string to minutes since midnight
 * @param timeStr - Time string in HH:mm format
 * @returns Minutes since midnight
 * @throws Error if format is invalid
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Expected HH:mm`);
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate duration in minutes between two time strings
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Duration in minutes
 * @throws Error if endTime is before startTime (night shifts not supported in MVP)
 */
export function calculateDurationMinutes(
  startTime: string,
  endTime: string,
): number {
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  if (endMins < startMins) {
    throw new Error(
      `End time ${endTime} is before start time ${startTime}. Night shifts are not supported in MVP.`,
    );
  }

  return endMins - startMins;
}

/**
 * Get week start date based on weekStartsOn
 * @param date - Date to get week start for
 * @param weekStartsOn - Day of week (0=Sun, 1=Mon, ..., 6=Sat)
 * @returns Week start date
 */
export function getWeekStart(date: Date, weekStartsOn: number): Date {
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = (dayOfWeek - weekStartsOn + 7) % 7;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Get week key string (YYYY-MM-DD format of week start)
 * @param date - Date
 * @param weekStartsOn - Day of week (0=Sun, 1=Mon, ..., 6=Sat)
 * @returns Week key string
 */
export function getWeekKey(date: Date, weekStartsOn: number): string {
  const weekStart = getWeekStart(date, weekStartsOn);
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const day = String(weekStart.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format minutes to HH:mm string
 * @param minutes - Total minutes
 * @returns Time string in HH:mm format
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

