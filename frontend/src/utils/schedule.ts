import { formatTime24, parseClockTime } from '@/utils/date';
import type { OpeningHours, Weekday } from '@/services/tourist-place';

/** Weekdays in display order (Monday → Sunday). */
export const WEEKDAYS: Weekday[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

/** i18n key for each weekday name, resolved via `t()` (never hardcoded). */
export const WEEKDAY_LABEL_KEY: Record<Weekday, string> = {
    MONDAY: 'weekday_monday',
    TUESDAY: 'weekday_tuesday',
    WEDNESDAY: 'weekday_wednesday',
    THURSDAY: 'weekday_thursday',
    FRIDAY: 'weekday_friday',
    SATURDAY: 'weekday_saturday',
    SUNDAY: 'weekday_sunday',
};

/** Editable per-day row used by the form and the schedule field. */
export type DaySchedule = {
    day: Weekday;
    open: boolean;
    openTime: Date | null;
    closeTime: Date | null;
};

/**
 * Parses a backend clock string into a `Date`. Backend `LocalTime` may include seconds
 * (`"09:00:00"`); only `HH:mm` is significant, so we take the first five characters.
 */
export function parseTimeToDate(value?: string | null): Date | null {
    if (!value) return null;
    return parseClockTime(value.slice(0, 5));
}

/** Builds the full 7-day editable schedule from the sparse list of open days. */
export function buildWeekSchedule(hours?: OpeningHours[] | null): DaySchedule[] {
    const byDay = new Map<Weekday, OpeningHours>();
    (hours ?? []).forEach((h) => byDay.set(h.dayOfWeek, h));
    return WEEKDAYS.map((day) => {
        const h = byDay.get(day);
        return h
            ? { day, open: true, openTime: parseTimeToDate(h.openTime), closeTime: parseTimeToDate(h.closeTime) }
            : { day, open: false, openTime: null, closeTime: null };
    });
}

/** Reduces the editable schedule to the API payload: only open days, times as `HH:mm`. */
export function scheduleToOpeningHours(schedule: DaySchedule[]): OpeningHours[] {
    return schedule
        .filter((d) => d.open && d.openTime && d.closeTime)
        .map((d) => ({
            dayOfWeek: d.day,
            openTime: formatTime24(d.openTime as Date),
            closeTime: formatTime24(d.closeTime as Date),
        }));
}

/** Formats an open day as a `HH:mm – HH:mm` range, or `null` when the day is closed. */
export function formatDayRange(row: DaySchedule): string | null {
    if (!row.open || !row.openTime || !row.closeTime) return null;
    return `${formatTime24(row.openTime)} – ${formatTime24(row.closeTime)}`;
}

// Maps JS `Date.getDay()` (0 = Sunday) to our Monday-first weekday keys.
const JS_DAY_TO_WEEKDAY: Weekday[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
];

/** The viewer's current weekday, for highlighting "today" in the schedule. */
export function currentWeekday(): Weekday {
    return JS_DAY_TO_WEEKDAY[new Date().getDay()];
}

/** Validates a single open day. Returns an i18n error key, or `null` when valid or closed. */
export function dayRowError(row: DaySchedule): string | null {
    if (!row.open) return null;
    if (!row.openTime || !row.closeTime) return 'error_opening_hours_incomplete';
    // Same-length 24-hour "HH:mm" strings compare correctly lexicographically.
    if (formatTime24(row.closeTime) <= formatTime24(row.openTime)) return 'error_closing_after_opening';
    return null;
}

/** Validates the whole schedule. Returns the first i18n error key, or `null` when all valid. */
export function validateSchedule(schedule: DaySchedule[]): string | null {
    for (const row of schedule) {
        const error = dayRowError(row);
        if (error) return error;
    }
    return null;
}
