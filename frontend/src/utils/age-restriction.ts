/**
 * Formats age restriction data for human-readable display.
 * Treats null, undefined, and 0 as "no restriction" for backward compatibility
 * with records that stored 0 instead of NULL.
 */
export function formatAgeRestriction(
    minAge: number | null | undefined,
    maxAge: number | null | undefined
): string {
    const hasMin = minAge != null && minAge > 0;
    const hasMax = maxAge != null && maxAge > 0;
    if (hasMin && hasMax) return `Age restriction: ${minAge}–${maxAge} years`;
    if (hasMin) return `Age restriction: ${minAge} years and older`;
    if (hasMax) return `Age restriction: Up to ${maxAge} years`;
    return 'No age restrictions';
}

/**
 * Validates the raw string values from age input fields before form submission.
 * Valid inputs per field: empty string, '0' (both mean no restriction), or '1'–'120'.
 * Returns a user-facing error message or null if validation passes.
 */
export function validateAgeFields(minAgeStr: string, maxAgeStr: string): string | null {
    const min = parseAgeInput(minAgeStr);
    const max = parseAgeInput(maxAgeStr);

    if (min === 'invalid') {
        return 'Minimum age must be a whole number between 1 and 120, or left empty for no restrictions.';
    }
    if (max === 'invalid') {
        return 'Maximum age must be a whole number between 1 and 120, or left empty for no restrictions.';
    }
    if (min !== null && max !== null && min > max) {
        return 'Minimum age cannot be greater than maximum age.';
    }
    return null;
}

/**
 * Converts a raw age string from a form field to a number suitable for API submission.
 *
 * Returns 0 for empty input or '0' — the backend receives the 0 and normalizes it to NULL
 * (meaning "no restriction"). Returning `undefined` here would cause JSON.stringify to omit
 * the field entirely, which the backend interprets as "don't update this field" rather than
 * "clear this field". Sending an explicit 0 guarantees the update always reaches the backend.
 */
export function parseAge(raw: string): number {
    const trimmed = raw.trim();
    if (!trimmed) return 0;
    const n = parseInt(trimmed, 10);
    return !isNaN(n) && n > 0 ? n : 0;
}

function parseAgeInput(raw: string): number | null | 'invalid' {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (!/^\d+$/.test(trimmed)) return 'invalid';
    const n = parseInt(trimmed, 10);
    if (n === 0) return null;
    if (n < 1 || n > 120) return 'invalid';
    return n;
}
