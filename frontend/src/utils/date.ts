import i18n from '@/config/i18n';

const FALLBACK_TIMEZONE = 'UTC';

/**
 * Serializes a `Date` to a plain ISO calendar date (`YYYY-MM-DD`) using its
 * local calendar fields. This is the single canonical way to send a date to the
 * backend or store it, so no screen builds date strings by hand.
 */
export function toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parses an ISO calendar date (`YYYY-MM-DD`, optionally with a time part) into a
 * local `Date` at midnight, avoiding timezone shifts. Returns `null` when the
 * value is empty or unparseable.
 */
export function parseISODate(value?: string | null): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match) return null;
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses a form date string into a local `Date`. Accepts both the ISO calendar
 * form (`YYYY-MM-DD`) and the day-first form (`DD/MM/YYYY`) that some flows keep
 * in state. Returns `null` when empty or unparseable.
 */
export function parseFormDate(value?: string | null): Date | null {
    if (!value) return null;
    const text = value.trim();
    if (text.includes('/')) {
        const parts = text.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts.map((part) => Number(part));
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    return parseISODate(text);
}

/**
 * Resolves the day/month/year fields of a date value without applying timezone
 * shifts. Accepts a local `Date` or an ISO calendar string.
 */
function resolveCalendarParts(value: Date | string): { day: string; month: string; year: string } | null {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return {
            day: String(value.getDate()).padStart(2, '0'),
            month: String(value.getMonth() + 1).padStart(2, '0'),
            year: String(value.getFullYear()),
        };
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match) return null;
    const [, year, month, day] = match;
    return { day, month, year };
}

/**
 * Formats a plain calendar date using the numeric format of the active language:
 * `DD/MM/YYYY` for Spanish and `MM/DD/YYYY` for English. This is the single
 * source of truth for numeric date display across the app.
 *
 * Accepts a local `Date` or an ISO calendar string. Empty values render as an
 * empty string; unparseable strings are returned untouched so unexpected values
 * are never silently hidden.
 */
export function formatLocalizedDate(
    value?: Date | string | null,
    language: string = i18n.language,
): string {
    if (value === null || value === undefined || value === '') return '';
    const parts = resolveCalendarParts(value);
    if (!parts) return typeof value === 'string' ? value : '';
    const { day, month, year } = parts;
    return language?.startsWith('es')
        ? `${day}/${month}/${year}`
        : `${month}/${day}/${year}`;
}

/** Formats a local `Date` as a 24-hour `HH:MM` clock string. */
export function formatTime24(date: Date): string {
    if (Number.isNaN(date.getTime())) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Parses an `HH:MM` clock string into a local `Date` (today, at that time).
 * Returns `null` when empty or malformed.
 */
export function parseClockTime(value?: string | null): Date | null {
    if (!value) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

export function addOneHour(timeValue: string): string {
    const parts = timeValue.split(':');
    if (parts.length < 2) return '';
    const hours = (Number.parseInt(parts[0], 10) + 1) % 24;
    return `${hours.toString().padStart(2, '0')}:${parts[1]}`;
}

export function formatDateInTimezone(utcString: string, timezone: string | undefined | null): string {
    const tz = timezone || FALLBACK_TIMEZONE;
    const date = new Date(utcString);
    if (Number.isNaN(date.getTime())) return utcString;
    return date.toLocaleDateString('en-US', {
        timeZone: tz,
        day: '2-digit',
        month: 'short',
    });
}

export function formatTimeInTimezone(utcString: string, timezone: string | undefined | null): string {
    const tz = timezone || FALLBACK_TIMEZONE;
    const date = new Date(utcString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/** Resolves the `YYYY-MM-DD` calendar date of an instant as seen in a timezone. */
function isoDateInTimezone(date: Date, timezone: string): string {
    try {
        // 'en-CA' yields an ISO-like `YYYY-MM-DD`, and is supported by Hermes.
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    } catch {
        return toISODate(date);
    }
}

export function formatDateTimeInTimezone(
    utcString: string,
    timezone: string | undefined | null
): { dateLabel: string; timeLabel: string } {
    const tz = timezone || FALLBACK_TIMEZONE;
    const date = new Date(utcString);
    if (Number.isNaN(date.getTime())) return { dateLabel: utcString, timeLabel: '' };
    return {
        // Numeric date shown localized (DD/MM/YYYY vs MM/DD/YYYY) but resolved in
        // the event's timezone so the calendar day stays correct.
        dateLabel: formatLocalizedDate(isoDateInTimezone(date, tz)),
        timeLabel: date.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }),
    };
}

export function getDeviceTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
    } catch {
        return FALLBACK_TIMEZONE;
    }
}

/**
 * Formats a user's birth date for display using the active language's numeric
 * format (`DD/MM/YYYY` in Spanish, `MM/DD/YYYY` in English).
 *
 * Input is the stored/API value: an ISO calendar date (`YYYY-MM-DD`, optionally
 * with a time part), parsed as plain calendar fields to avoid timezone shifts.
 * Thin wrapper over {@link formatLocalizedDate} kept for call-site readability.
 */
export function formatBirthDate(value?: string | null): string {
    return formatLocalizedDate(value);
}

export function getTimezoneOffsetStr(ianaTimezone: string, date: Date): string {
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: ianaTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(date);

        const p: Record<string, string> = {};
        for (const part of parts) p[part.type] = part.value;

        const hour = p.hour === '24' ? 0 : parseInt(p.hour, 10);
        const localAsUtcMs = Date.UTC(
            parseInt(p.year, 10),
            parseInt(p.month, 10) - 1,
            parseInt(p.day, 10),
            hour,
            parseInt(p.minute, 10),
            parseInt(p.second, 10),
        );

        const diffMin = Math.round((localAsUtcMs - date.getTime()) / 60000);
        const sign = diffMin >= 0 ? '+' : '-';
        const abs = Math.abs(diffMin);
        return `${sign}${Math.floor(abs / 60).toString().padStart(2, '0')}:${(abs % 60).toString().padStart(2, '0')}`;
    } catch {
        return '+00:00';
    }
}

export function buildDateTimeWithTimezone(dateStr: string, timeStr: string, timezone: string): string | null {
    const dateText = dateStr.trim();
    const timeText = timeStr.trim();
    if (!dateText || !timeText) return null;

    let day = '';
    let month = '';
    let year = '';

    if (dateText.includes('/')) {
        const parts = dateText.split('/');
        if (parts.length !== 3) return null;
        [day, month, year] = parts;
    } else if (dateText.includes('-')) {
        const parts = dateText.split('-');
        if (parts.length !== 3) return null;
        [year, month, day] = parts;
    } else {
        return null;
    }

    const timeParts = timeText.split(':');
    if (timeParts.length < 2) return null;
    const [hour, minute] = timeParts;

    const normalizedDate = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const normalizedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    const referenceDate = new Date(`${normalizedDate}T${normalizedTime}:00Z`);
    const offsetStr = getTimezoneOffsetStr(timezone, referenceDate);

    return `${normalizedDate}T${normalizedTime}:00${offsetStr}`;
}

export function getLocalPartsInTimezone(
    utcDate: Date,
    timezone: string
): { date: string; time: string } {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(utcDate);
        const p: Record<string, string> = {};
        for (const part of parts) p[part.type] = part.value;
        return {
            date: `${p.day}/${p.month}/${p.year}`,
            time: `${p.hour === '24' ? '00' : p.hour}:${p.minute}`,
        };
    } catch {
        const d = utcDate;
        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear().toString();
        const hour = d.getUTCHours().toString().padStart(2, '0');
        const minute = d.getUTCMinutes().toString().padStart(2, '0');
        return { date: `${day}/${month}/${year}`, time: `${hour}:${minute}` };
    }
}
