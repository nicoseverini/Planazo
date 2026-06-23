export type Interest =
    | 'FOOD' | 'CULTURE' | 'NATURE' | 'BEACH' | 'ADVENTURE'
    | 'NIGHTLIFE' | 'SPORTS' | 'SHOPPING' | 'HISTORY' | 'MOUNTAINS' | 'OTHER';

export const INTEREST_OPTIONS: { label: string; value: Interest }[] = [
    { label: 'Food',      value: 'FOOD' },
    { label: 'Culture',   value: 'CULTURE' },
    { label: 'Nature',    value: 'NATURE' },
    { label: 'Beach',     value: 'BEACH' },
    { label: 'Adventure', value: 'ADVENTURE' },
    { label: 'Sports',    value: 'SPORTS' },
    { label: 'Nightlife', value: 'NIGHTLIFE' },
    { label: 'Shopping',  value: 'SHOPPING' },
    { label: 'History',   value: 'HISTORY' },
    { label: 'Mountains', value: 'MOUNTAINS' },
    { label: 'Other',     value: 'OTHER' },
];

export const INTEREST_LABEL: Record<Interest, string> = Object.fromEntries(
    INTEREST_OPTIONS.map(({ value, label }) => [value, label])
) as Record<Interest, string>;

/**
 * Converts a backend interest key to a display label.
 * Falls back to title-casing for unknown values (e.g. BOARD_GAMES → "Board Games").
 */
export function formatInterest(interest: string): string {
    const known = INTEREST_LABEL[interest as Interest];
    if (known) return known;
    return interest
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
