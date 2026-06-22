const FALLBACK_TIMEZONE = 'UTC';

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

export function formatDateTimeInTimezone(
    utcString: string,
    timezone: string | undefined | null
): { dateLabel: string; timeLabel: string } {
    const tz = timezone || FALLBACK_TIMEZONE;
    const date = new Date(utcString);
    if (Number.isNaN(date.getTime())) return { dateLabel: utcString, timeLabel: '' };
    return {
        dateLabel: date.toLocaleDateString('en-US', { timeZone: tz }),
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
