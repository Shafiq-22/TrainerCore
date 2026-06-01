import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInCalendarDays,
  isToday as dfIsToday,
  parseISO,
} from 'date-fns';

/** GCC business week starts on Sunday. */
export const WEEK_STARTS_ON = 0 as const;
export const SCHEDULE_START_HOUR = 6; // 6 AM
export const SCHEDULE_END_HOUR = 22; // 10 PM
export const TIMEZONE = 'Asia/Dubai';

export function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

export function weekStart(d: Date = new Date()): Date {
  return startOfWeek(d, { weekStartsOn: WEEK_STARTS_ON });
}

export function weekEnd(d: Date = new Date()): Date {
  return endOfWeek(d, { weekStartsOn: WEEK_STARTS_ON });
}

/** Array of the 7 day-Dates for the week containing `d`, Sunday-first. */
export function weekDays(d: Date = new Date()): Date[] {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDate(value: string | Date): string {
  return format(toDate(value), 'dd MMM yyyy');
}

export function formatDateTime(value: string | Date): string {
  return format(toDate(value), 'dd MMM yyyy, h:mm a');
}

export function formatTime(value: string | Date): string {
  return format(toDate(value), 'h:mm a');
}

export function formatDayMonth(value: string | Date): string {
  return format(toDate(value), 'dd MMM');
}

export function isToday(value: string | Date): boolean {
  return dfIsToday(toDate(value));
}

export function daysSince(value: string | Date): number {
  return differenceInCalendarDays(new Date(), toDate(value));
}

export function daysUntil(value: string | Date): number {
  return differenceInCalendarDays(toDate(value), new Date());
}

export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
